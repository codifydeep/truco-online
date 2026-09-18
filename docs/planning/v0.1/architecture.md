# ADR — Primeira fatia web/lobby do Truco Online v0.1

**Identificador:** ADR-TRUCO-V0.1-LOBBY-R1
**Perfil:** CTO/Tech Lead
**Status:** Proposto (envio para revisão do Tech Lead)
**Brief de referência:** BRIEF-TRUCO-v0.1-R1-20260916 (SHA `273d7760dc25b2641631a98a8d3aef352883d4a92469c145154285e9dd17d403`)
**Escopo deste ADR:** stack open source ARM64 local, sessão sem autenticação, isolamento, protocolo e contrato de erros, atomicidade da última vaga, reconexão, testes TDD/integração/E2E, Compose e evolução para 3D.
**Natureza:** documento de arquitetura. Não implementa código, não abre PR, não publica release. As decisões técnicas abaixo pertencem ao CTO/Tech Lead, não ao CEO.

---

## Objetivo

Registrar a arquitetura da primeira fatia (lobby funcional em dois navegadores) do Truco Paulista v0.1, aprovando uma base técnica concreta e verificável para os aceites LOB-01 a LOB-07. O documento deve:

1. Escolher e justificar a stack open source rodando em Docker local ARM64, sem serviços pagos.
2. Definir sessão sem autenticação com isolamento entre navegadores.
3. Definir protocolo cliente↔servidor e contrato de erros.
4. Garantir atomicidade da última vaga sob entradas concorrentes (LOB-04).
5. Definir política de abandono/quedas e reconexão (LOB-06, V01-08).
6. Definir estratégia de testes TDD, integração e E2E em dois navegadores.
7. Definir o Compose e o pipeline de CI/QA local, incluindo rollback.
8. Preparar o caminho de evolução para a partida 3D (V01-07) sem engessar o lobby.

Este ADR atende apenas a fatia de lobby. "Sala completa" aqui significa capacidade 2 atingida, **não** partida implementada. A v0.1 permanece ATIVA; o lobby é um marco intermediário, não homologação.

---

## Decisões

Cada decisão compara alternativas, escolhe e justifica. Hipóteses não medidas são explicitamente separadas de evidências (ver seção final). Nenhuma decisão invoca serviços pagos.

### D1 — Backend: Node.js 22 LTS + TypeScript + Fastify (HTTP) + `ws` (WebSocket)

**Alternativas consideradas:** (a) Elixir/Phoenix Channels; (b) Go + gorilla/websocket; (c) Node.js + Socket.IO; (d) Node.js + Fastify + `ws` nativo.

**Decisão:** (d).

**Justificativa:** uma única linguagem (TypeScript) em backend e frontend reduz atrito de contrato de tipos compartilhados; ARM64 tem imagens oficiais `node:22-alpine`. Elixir é excelente para concorrência e Phoenix Channels ofereceria ótima reconexão, mas introduz segunda linguagem no time e aumenta a superfície de aprendizado para a fatia. Go é ótimo e compila nativamente para ARM64, porém mantém dois ecossistemas e um protocolo mais manual. Socket.IO traz reconexão embutida e fallbacks, mas esconde o protocolo atrás de sua camada própria — este ADR prefere um protocolo JSON explícito e testável por frames, por isso `ws` nativo com reconexão implementada no cliente (D7).

**Consequências:** a reconexão é responsabilidade nossa (documentada e testada). Ganhamos transparência no contrato e integração testável frame a frame.

### D2 — Estado: PostgreSQL 17 (Docker, ARM64) como fonte de verdade transacional

**Alternativas consideradas:** (a) apenas estado em memória no processo Node; (b) Redis (Lua/WATCH); (c) PostgreSQL.

**Decisão:** (c) PostgreSQL 17.

**Justificativa:** o brief exige "aplicação, banco, CI e homologação em Docker local". PostgreSQL é open source com imagem oficial ARM64, dá durabilidade (sala sobrevive a restart do servidor de forma auditável) e oferece atomicidade real da última vaga via transação com `SELECT ... FOR UPDATE` — o requisito mais sensível da fatia (LOB-04). Memória pura é a mais simples, porém perde estado no restart e dificulta teste de concorrência determinístico; Redis resolve atomicidade via script Lua mas duplica o armazenamento e adiciona um componente sem necessidade para uma fatia com volume trivial. Postgres serve também à evolução futura (placar persistente, histórico).

**Consequências:** introduzimos migrações versionadas (node-pg-migrate) executadas antes do servidor subir. O estado da sala fica na base; as mensagens WebSocket são apenas projeções de eventos, nunca a fonte de verdade.

### D3 — Sessão sem autenticação: token opaco em cookie HttpOnly + SameSite=Lax

**Alternativas consideradas:** (a) token em `localStorage`; (b) apelido como identidade; (c) cookie HttpOnly com id de sessão cripto-aleatório (256 bits).

**Decisão:** (c).

**Justificativa:** o apelido não identifica a sessão (LOB-05 permite apelidos iguais). O id de sessão é gerado no servidor (`crypto.randomUUID` + salt de 256 bits), não é adivinhável e não tem relação com o apelido. Cookie HttpOnly não é legível por XSS, reforçando a segurança de texto exibido (LOB-05). SameSite=Lax mantém o cookie em requisições e WebSocket da mesma origem sem abrir CSRF cross-site relevante nesta fatia (sem mutação sensível fora da sala do próprio usuário). Cada navegador/janela anônima tem cookie independente → isolamento natural entre dois clientes.

**Consequências:** a identidade é um token efêmero por navegador; a reconexão mantém a mesma sessão enquanto o cookie persistir. Sem autenticação de longa duração — fora do escopo da v0.1 (login não está no brief).

### D4 — Protocolo: comandos via HTTP REST idempotentes + eventos via WebSocket (assinatura push)

**Alternativas consideradas:** (a) tudo sobre WebSocket; (b) HTTP para comandos e WS apenas para push; (c) polling HTTP puro.

**Decisão:** (b).

**Justificativa:** comandos de criação/entrada/saída são mutações que precisam de atomicidade transacional e status HTTP canônicos (201, 200, 404, 409, 422) — mais fáceis de testar e auditar em REST. O WebSocket fica responsável apenas por assinar e receber eventos em tempo real (lista de salas e estado da sala), atendendo LOB-02 ("sem recarregar a página"). Polling puro é mais simples porém viola a experiência de atualização imediata e o requisito de reconexão elegante; tudo-sobre-WS dilui o contrato de erros HTTP que já precisamos para concorrência. A separação mantém cada transport com responsabilidade única e testável.

**Endpoints REST (comandos):**

| Método/rota | Descrição | Respostas |
|---|---|---|
| `POST /api/session` | Cria sessão a partir do apelido (valida LOB-05). | 201; 422 `NICKNAME_INVALID`/`NICKNAME_EMPTY` |
| `GET /api/rooms` | Lista salas aguardando 2º jogador (capacidade livre). | 200 lista |
| `POST /api/rooms` | Cria sala; criador ocupa assento 1. | 201 room; 409 `SESSION_ALREADY_IN_ROOM` |
| `POST /api/rooms/:id/join` | Entra na última vaga, atomicamente. | 200 room; 404 `ROOM_NOT_FOUND`; 409 `ROOM_FULL`; 403 `SESSION_ALREADY_IN_ROOM` |
| `POST /api/rooms/:id/leave` | Sai da sala / host cancela. | 204; 404 `ROOM_NOT_FOUND` |
| `GET /api/rooms/:id` | Estado atual de uma sala (resync/reconexão). | 200 room; 404 `ROOM_NOT_FOUND` |

**Eventos WebSocket (push):** envelope `{ type, seq, data }`; tipos: `room_list_updated`, `room_updated` (participantes e estado), `session_invalid`. `seq` é monotônico por sessão para o cliente detectar lacunas e re-sincronizar.

### D5 — Contrato de erros unificado

**Decisão:** envelope JSON consistente em HTTP e WS.

- HTTP: `{ error: { code, message, requestId } }` + status HTTP canônico.
- WS: `{ type: "error", data: { code, message } }`.
- Códigos: `NICKNAME_EMPTY`, `NICKNAME_INVALID`, `SESSION_INVALID`, `SESSION_ALREADY_IN_ROOM`, `ROOM_NOT_FOUND`, `ROOM_FULL`, `INVALID_OPERATION`, `RATE_LIMITED`.

`requestId` (ou `seq` no WS) permite correlacionar log ↔ cliente ↔ teste. Mensagens são textos curtos exibidos como texto puro (nunca renderizados como HTML/script — LOB-05).

### D6 — Atomicidade da última vaga (LOB-04)

**Decisão:** `POST /api/rooms/:id/join` executa dentro de transação PostgreSQL com `SELECT ... FOR UPDATE` na linha da sala e valida a capacidade antes do update.

**Justificativa:** duas requisições concorrentes pela última vaga são serializadas pelo lock de linha; a segunda lê a sala já cheia e responde `409 ROOM_FULL`. Isso cobre o cenário de teste automatizado exigido (duas tentativas concorrentes) e também o caso de dois navegadores reais disputando simultaneamente. Um contador em memória não ofereceria essa garantia se o servidor for escalado ou reiniciado.

**Consequência:** join é idempotente por sessão: se a sessão já está na sala, responde 409 `SESSION_ALREADY_IN_ROOM` em vez de tentar ocupar dois assentos.

### D7 — Abandono/quedas e reconexão (LOB-06, V01-08)

**Decisão:** heartbeat por WebSocket a cada 10s; ausência de 30s marca a conexão como morta e libera o recurso.

- Sala **aguardando** (1/2): se o host fica ausente por 30s (queda/cancelamento), a sala é cancelada e removida da lista. Se o convidado sai, o assento 2 é liberado e a sala volta a aparecer como disponível.
- Sala **completa** (2/2): nesta fatia é estado terminal de exibição (não há partida). Se um participante desconecta, o assento é liberado após a graça e a sala retorna a "aguardando" — nunca fica como "sala falsa disponível indefinidamente".

**Reconexão (cliente):** retry com backoff exponencial (500ms → dobra → teto 5s). No reconectar, re-assina; o cliente re-sincroniza via `GET /api/rooms` + `GET /api/rooms/:id` (idempotente) para reconciliar qualquer evento perdido (detectado por lacuna de `seq`). O cookie de sessão persiste, então a identidade é preservada sem reautenticação. Se a sessão expirou/invalidou, o cliente recebe `SESSION_INVALID` e retorna ao fluxo de apelido com mensagem clara (estado de erro documentado).

**Nota de produto:** a experiência de espera/saída (textos, botões) será documentada pelo Produto; este ADR define a política técnica de tempo e identidade.

### D8 — Frontend: React + TypeScript + Vite, com camada/estratégia de renderização para 3D

**Decisão:** frontend React 18 + TypeScript + Vite. O lobby é 2D e não importa Three.js. A partida 3D (V01-07) será adicionada por trás de uma interface de renderer (`IRenderer`) e um `lazy import`, mantendo o lobby leve e o bundle 3D separado. A estratégia de renderização por trás dessa interface (engine 3D, cena, câmera) fica encapsulada e trocável, sem acoplar o lobby à escolha concreta.

**Alternativas consideradas:** (a) Svelte; (b) Vue; (c) vanilla. React + TypeScript foi escolhido por ecossistema maduro, tipagem compartilhada com o backend e suporte robusto a testes (Vitest/Testing Library) e ao `lazy` para o módulo 3D. Svelte/Vue são válidos, mas React já é a aposta de menor risco para evolução 3D com Three.js e bibliotecas de exemplo.

**Evolução para 3D:** a decisão do renderer concreto e da engine 3D (Three.js candidata) é do CTO e será registrada em ADR próprio quando a partida for planejada. Este ADR apenas garante a costura (interface de renderer `IRenderer` + code-splitting/`lazy`) para não engessar o lobby.

### D9 — Testes: TDD unitário + integração + E2E em dois navegadores

**Decisão:** três camadas, Red-Green para os aceites da fatia.

1. **Unitário (Vitest):** validação de apelido (LOB-05), mapeamento de códigos de erro, lógica pura de assentos.
2. **Integração (Vitest + supertest contra Postgres real do Compose):** criação/lista/entrada/saída, contrato de erros, e o teste determinístico de atomicidade — disparar duas entradas concorrentes pela última vaga e exigir exatamente um sucesso e um `409 ROOM_FULL` (LOB-04). Também o teste de timeout de sala (LOB-06) com clock controlado.
3. **E2E (Playwright, chromium ARM64):** dois `BrowserContext` independentes simulando os dois navegadores (LOB-01..03), terceiro cliente bloqueado, apelido vazio rejeitado com exibição segura, e a corrida pela última vaga. Roda no CI do Compose.

**Decisões complementares:** testes existentes nunca são apagados/enfraquecidos para tornar PR verde; ninguém revisa o próprio trabalho; CI e QA pós-deploy referenciam o mesmo commit (V01-09).

### D10 — Docker Compose e CI local (ARM64)

**Serviços do `docker-compose.yml`:**

| Serviço | Imagem | Papel |
|---|---|---|
| `postgres` | `postgres:17-alpine` (arm64) | estado transacional; healthcheck |
| `migrate` | `node:22-alpine` (arm64) | roda migrações versionadas antes do `server` |
| `server` | `node:22-alpine` (arm64) | API REST + WebSocket; serve o build estático do `web` na mesma origem |
| `web` | `node:22-alpine` (arm64) | dev server Vite (dev) que faz proxy `/api` e `/ws`; build estático (prod) servido pelo `server` |
| `ci` | `node:22-alpine` (arm64) + Chromium do Playwright | linter, unit, integração, E2E; one-off |
| `e2e` | Playwright (arm64) | run dos cenários E2E em dois contextos |

**Decisão:** servir o build estático pelo próprio `server` em produção local (uma única origem → cookie HttpOnly e WebSocket sem CORS cross-origin). Em dev, o Vite faz proxy. **Rollback:** o Compose usa tags de imagem fixas por release (`release/v0.1`); rollback = reverter a tag/commit e recriar o compose a partir do snapshot anterior, com passo comprovado em evidência (V01-10).

**CI local:** o serviço `ci` executa `lint → test:unit → test:integration → test:e2e` contra o stack do próprio Compose, registrando saída e recibo durável. Sem liberar cards de implementação antes das pré-condições do brief.

---

## Critérios verificáveis

Critérios objetivos, mapeados aos aceites da fatia. Evidência = saída de teste/CI + captura + log, registrada como recibo durável.

| ID | Critério verificável | Como verificar |
|---|---|---|
| CV-01 | Navegador A cria sessão com apelido e sala; vê id e "aguardando". | E2E LOB-01 |
| CV-02 | Navegador B (cookie independente) vê a sala de A sem recarregar. | E2E LOB-02 via evento WS `room_list_updated` |
| CV-03 | B entra; ambos veem 2 participantes e estado "completa". | E2E LOB-03 |
| CV-04 | Terceiro cliente é bloqueado (409 `ROOM_FULL`) e a sala sai da lista; teste concorrente da última vaga dá exatamente 1 sucesso + 1 409. | integração LOB-04 |
| CV-05 | Apelido vazio → 422 `NICKNAME_EMPTY`; texto exibido sem execução HTML/script (escape verificado). | unit + integração + E2E LOB-05 |
| CV-06 | Sala aguardando com host ausente 30s é cancelada; convidado que sai libera a vaga; sala completa libera vaga na queda. | integração com clock controlado + E2E LOB-06 |
| CV-07 | Reconexão: cliente re-assina e re-sincroniza por `GET /api/rooms`; lacuna de `seq` dispara resync; sessão inválida → `SESSION_INVALID` com estado claro. | integração + E2E |
| CV-08 | Testes Red-Green, regressão, revisão independente, CI e QA em dois navegadores registrados; Compose saudável, URL acessível e rollback comprovado. | CI local + evidência de QA (V01-07/V01-09/V01-10 da fatia LOB-07) |
| CV-09 | O bundle do lobby não carrega Three.js; o renderer 3D fica atrás de `IRenderer` + `lazy`. | revisão de código + checagem de bundle |
| CV-10 | Nenhum serviço pago/cloud é usado; tudo roda em Docker ARM64 local. | inspeção do Compose e do pipeline |

**Hipóteses não medidas (separadas de evidências):** os critérios de desempenho do brief (lobby refletindo no 2º navegador em ≤1s no p95 em 30 operações; partida 3D ≥30 FPS médios em 60s) são **metas a validar no host de homologação**, não resultados já obtidos. Este ADR **não inventa benchmark**; eles serão medidos e registrados pelo QA com hardware, navegadores, carga e método de medição documentados quando as respectivas fatias existirem. A fatia de lobby mede apenas latência funcional de reflexo (CV-02) como baseline descritiva, sem atribuir um número de referência não medido.

---

## Riscos e pendências

| # | Risco/pendência | Mitigação / responsável |
|---|---|---|
| R1 | Concorrência da última vaga falha em produção se a transação não for bem implementada. | Teste de integração determinístico com 2 joins concorrentes (CV-04) obrigatório no gate; revisão independente. |
| R2 | Reconexão com lacuna de eventos causa estado dessincronizado. | Re-sync idempotente por `GET` + detecção de lacuna via `seq` (D4/D7). |
| R3 | Estado em Postgres adiciona componente e migrações à fatia. | Migrações versionadas em `migrate` antes do `server`; healthcheck; rollback por tag fixa (D10). |
| R4 | `ws` nativo sem reconexão embutida aumenta trabalho do cliente. | Política documentada e testada (D7); alternativa Socket.IO revisitada se custo subir. |
| R5 | Cookie HttpOnly + WebSocket na mesma origem exige servir estático pelo server (sem CORS cross-origin). | Build único de origem (D10); validado no E2E. |
| R6 | Sem autenticação, qualquer navegador pode criar sessão; abuso/rate. | `RATE_LIMITED` no contrato; limitação por IP/rota na fatia; registrado para QA. |
| R7 | "Sala completa" mal interpretada como partida entregue. | Estado "completa" sem botão de jogo; brief mantém v0.1 ATIVA (documentado neste ADR). |
| R8 | Desempenho (1s p95 / 30 FPS) são metas não medidas. | Não declarar como evidência; QA mede e registra método (seção Hipóteses não medidas). |
| P1 | Pré-condições operacionais do brief (recibo deepseek ds1, contrato Qwen, gateways do board, ferramentas fechadas da fixture) ainda não declaradas concluídas. | Confirmadas pelos perfis responsáveis antes de qualquer card de implementação. |
| P2 | Decisão do renderer/engine 3D e do contrato de regras (manilhas, empates, escalada, mão de onze/ferro) fica para ADRs/histórias posteriores. | Não bloqueiam o lobby; produto apresenta contrato antes de V01-05. |
| P3 | Rollback ainda não comprovado nesta fase de planejamento. | Procedimento definido (D10); evidência de rollback é requisito do gate LOB-07 (CV-08). |

**Pendência de revisão:** este ADR segue para revisão independente do Tech Lead. Nenhum código, PR, deploy ou release é executado por este planejamento. Nenhuma alegativa de que CI/deploy foram executados consta neste documento — ele apenas define critérios e procedimentos para que tais execuções futuras sejam registradas como evidência.