# PLAN.md — Grafo TDD da primeira fatia do Truco Online v0.1

**Tarefa:** t_3c648e2e
**Perfil:** techlead (AUTHOR)
**Brief de referência:** BRIEF-TRUCO-v0.1-R1-20260916
**SHA-256 do brief:** `273d7760dc25b2641631a98a8d3aef352883d4a92469c145154285e9dd17d403`
**Dependências revisadas (aprovadas):**
- `t_10ca48e7` — Produto: histórias LOB-01..07 (Given/When/Then)
- `t_66a7d8ef` — ADR `ADR-TRUCO-V0.1-LOBBY-R1` (stack, protocolo, erros, atomicidade, reconexão, Compose)
- `t_fd99c33d` — Design corrigido do lobby (estados, wireframes, acessibilidade, responsividade)

**Natureza deste documento:** consolida as histórias/ADR/design aprovados num **grafo TDD proposto**, em **português brasileiro**, usando apenas os **IDs canônicos** de perfil (`backend_data`, `frontend`, `devops`, `quality_security`, `techlead`, `designer`, `produto`, `cto`, `mobile`) conforme a matriz canônica de revisores. **Não** cria nem executa cards de implementação. **Não** implementa, **não** abre PR/merge, **não** faz deploy, **não** publica release. Termina na entrega terminal. As decisões técnicas pertencem ao CTO/Tech Lead (não ao CEO).

---

## Objetivo

Consolidar as histórias de produto (LOB-01..07), o ADR técnico e o design de UX num **grafo de tarefas TDD proposto**, pequeno e com **IDs locais**, onde cada tarefa declara: responsável, revisor independente, dependências **acíclicas**, contrato de API e verificação **Red/Green/regressão** com testes unitários, de integração, E2E, QA e deploy. O grafo:

1. Mapeia cada **LOB-01..07** a tarefas concretas do lobby (fatia).
2. Registra como a **v0.1 completa** continuará até **V01-01..10**, deixando constância de que **o lobby não encerra o release** (a v0.1 permanece ATIVA até cumprir a versão completa).
3. **Explicita o bloqueio de execução**: nenhum card é executado até as pré-condições operacionais e a validação do mecanismo de worktrees/PRs serem confirmadas, e até a CI por `pull_request` real ser reproduzida.
4. Documenta os **marcos de decisão técnica** já decididos no ADR (contrato API, políticas de timeout/identidade, atomicidade da última vaga, reconexão), sem reabrir discussão de produto.

Este texto é a **revisão integral em português brasileiro** do grafo da fatia, comparando com o design e o ADR aprovados, corrigindo o uso inconsistente de perfis e a grafia, e mantendo os 21 IDs `TDD-01..TDD-21` e a cobertura completa `LOB-01..07` / `V01-01..10` sem enfraquecer nenhum teste.

**Fora do escopo desta entrega:** qualquer implementação, criação/execução de cards de implementação, PR/merge, deploy, release, renderização 3D e regras de Truco Paulista (V01-05/06/07). Este documento **não declara** produto, worktrees ou governança já integrados: as pré-condições operacionais e a integração dos documentos em `release/v0.1` por PR revisado permanecem **pendentes**, conforme a seção de riscos.

---

## Decisões

### D1 — Formato do grafo: tarefas pequenas com IDs locais, responsável e revisor independentes, matriz canônica

Cada tarefa identifica-se com um ID local `TDD-XX`, atribui-se a um **único responsável** (perfil) e a um **revisor independente** de perfil distinto (ninguém revisa o próprio trabalho). O grafo é um **DAG** (dependências acíclicas). Respeitam-se os limites do brief: **9 perfis, máximo 2 workers simultâneos e 1 por perfil**; o grafo sequencia para não superar essa concorrência por perfil.

**Matriz canônica de revisão (obrigatória, aplicada a toda tarefa):**

| Autor | Revisor |
|---|---|
| `produto` | `techlead` |
| `designer` | `produto` |
| `cto` | `techlead` |
| `techlead` | `cto` |
| `backend_data` | `techlead` |
| `frontend` | `techlead` |
| `mobile` | `techlead` |
| `devops` | `quality_security` |
| `quality_security` | `techlead` |

Perfis usados na fatia: `backend_data`, `frontend`, `devops`, `quality_security`, `techlead`, `designer`, `cto`, `produto`. `mobile` permanece **sem implementação na v0.1** (fora do escopo do brief). **Não** são usados aliases como `backend` ou `qa`: os autores/revisores são sempre os IDs canônicos acima. As evidências de QA/segurança pertencem ao perfil canônico `quality_security`; a camada de dados pertence a `backend_data`.

### D2 — Contrato de API e protocolo: tomado do ADR, sem reabrir decisão

O contrato fixa-se como **contrato de tipos compartilhados** (pacote `shared/`) entre servidor e web, derivado do ADR D4/D5:

**Endpoints REST (comandos, mutações atômicas com status HTTP):**

| Método/rota | Descrição | Respostas |
|---|---|---|
| `POST /api/session` | Cria sessão a partir do apelido (valida LOB-05). | 201; 422 `NICKNAME_EMPTY`/`NICKNAME_INVALID` |
| `GET /api/rooms` | Lista salas aguardando 2º (vaga livre). | 200 lista |
| `POST /api/rooms` | Cria sala; o criador ocupa o assento 1. | 201 room; 409 `SESSION_ALREADY_IN_ROOM` |
| `POST /api/rooms/:id/join` | Entra na última vaga, atomicamente. | 200 room; 404 `ROOM_NOT_FOUND`; 409 `ROOM_FULL`; 403 `SESSION_ALREADY_IN_ROOM` |
| `POST /api/rooms/:id/leave` | Sair / cancelar sala. | 204; 404 `ROOM_NOT_FOUND` |
| `GET /api/rooms/:id` | Estado atual de uma sala (resync/reconexão). | 200 room; 404 `ROOM_NOT_FOUND` |

**Eventos WebSocket (push):** envelope `{ type, seq, data }`; tipos `room_list_updated`, `room_updated`, `session_invalid`. `seq` monotônico por sessão para detectar lacunas e ressincronizar.

**Contrato de erros unificado (HTTP e WS):** envelope JSON `{ error: { code, message, requestId } }` (HTTP, com status canônico) e `{ type: "error", data: { code, message } }` (WS). Códigos: `NICKNAME_EMPTY`, `NICKNAME_INVALID`, `SESSION_INVALID`, `SESSION_ALREADY_IN_ROOM`, `ROOM_NOT_FOUND`, `ROOM_FULL`, `INVALID_OPERATION`, `RATE_LIMITED`. Mensagens exibem-se como **texto puro**, nunca como HTML/script (LOB-05).

**Identidade/tempo (ADR D3/D7):** cookie `HttpOnly` com id de sessão cripto-aleatório (256 bits) `SameSite=Lax`; o apelido não identifica a sessão; heartbeat WS a cada 10s; ausência de 30s marca a conexão como morta e libera o recurso; reconexão do cliente com backoff exponencial (500ms → dobra → teto 5s) e resync idempotente por `GET`. Capacidade de sala = 2 aplicada no servidor com `SELECT ... FOR UPDATE` dentro de uma transação (atomicidade da última vaga, LOB-04).

**Alternativas avaliadas e descartadas no ADR** (não se reabrem aqui, **ratificam-se**): Socket.IO (protocolo opaco frente a frames JSON explícitos), estado só em memória/Redis (perde durabilidade e atomicidade transacional), identidade por apelido (contradiz LOB-05), polling HTTP puro (viola "sem recarregar"). Permanece **pendente** a engine 3D e o contrato de regras (ADR P2), para ADRs posteriores antes de V01-05/07.

### D3 — Estratégia TDD em três camadas (Red → Green → Regression)

Para cada tarefa funcional: escrever primeiro o **teste que falha** (Red), implementar o mínimo para passá-lo (Green) e manter a suíte em **Regression** verde sem apagar/enfraquecer provas anteriores (assinado em todas as tarefas). Camadas:

1. **Unitário (Vitest):** validação do apelido (LOB-05), mapeamento de códigos de erro, lógica de assentos e regras puras.
2. **Integração (Vitest + supertest contra Postgres real do Compose):** create/list/join/leave, contrato de erros, **atomicidade da última vaga** (2 joins concorrentes → 1 sucesso + 1 `409 ROOM_FULL`), timeout de sala com clock controlado (LOB-06), reconexão/resync/lacuna de `seq`.
3. **E2E (Playwright, chromium ARM64):** dois `BrowserContext` independentes (os dois navegadores), terceiro bloqueado, corrida pela última vaga, apelido vazio rejeitado com exibição segura.

### D4 — Compose e CI local ARM64

Serviços: `postgres` (17-alpine), `migrate` (node:22-alpine, migrações versionadas antes do `server`), `server` (node:22-alpine; serve o build estático do `web` numa única origem para cookie HttpOnly e WS sem CORS), `web` (dev server Vite com proxy `/api` e `/ws`; build estático em prod servido pelo `server`), `ci` (lint → unit → integration → e2e, one-off), `e2e` (Playwright). **Rollback** por tags de imagem fixas por release (`release/v0.1`): reverter tag/commit e recriar o compose a partir do snapshot anterior, com passo comprovado em evidência. Sem serviços pagos/cloud (ADR D10, CV-10).

**CI:** o serviço `ci` executa `lint → test:unit → test:integration → test:e2e` contra o stack do próprio Compose e registra saída e recibo durável. A CI executada por `workflow_dispatch` (manual) **não comprova o evento `pull_request`** — o passo `pull_request`-only do quality-gates é omitido em dispatch. A reprodução completa do gate em evento `pull_request` real permanece **pendência técnica** (ver D5/R5/P2).

### D5 — Bloqueio de execução e gates (explícito)

Este documento é um **grafo proposto**, não autorização de execução. A execução permanece **bloqueada** até que se cumpram, de forma verificável, e **sem este plano declará-las concluídas**:

1. **Pré-condições operacionais do brief**, a confirmar pelos perfis responsáveis antes da primeira card de implementação: vincular o recibo aprovado do ensaio deepseek ds1 à liberação técnica; atualizar o contrato instalado que ainda exige Qwen e conferir divergências; trocar o escopo dos gateways/supervisor do ensaio para o board de produto, preservando snapshots e resultados anteriores; registrar a aprovação deste brief e configurar os gates próprios do produto (as ferramentas fechadas da fixture HTTP não bastam); validar despacho, worktrees, GitHub, revisão e limites sem liberar cards de implementação.
2. **Integração de documentos por PR:** as histórias (`t_10ca48e7`), o ADR (`t_66a7d8ef`), o design (`t_fd99c33d`) e este grafo integram-se em `release/v0.1` **por PR revisado**. **Nenhum card do grafo TDD inicia antes dessa integração.** Este documento **não declara** produto, worktrees ou governança já integrados — essa etapa permanece pendente.
3. **CI por `pull_request` real:** a reprodução completa do gate em um evento `pull_request` real permanece **pendência técnica**; um `workflow_dispatch` verde não comprova esse evento. Deve ser fechada antes da implementação.

### D6 — O lobby não encerra o release

Concluir LOB-01..07 é um **marco intermediário**. A v0.1 completa exige ainda V01-04..07 (regras, privacidade de cartas, 3D). O estado "sala completa" **não** desenha botão de jogo simulado; a transição pré-jogo é apenas o limite da fatia. O grafo TDD proposto aqui entrega a **fatia de lobby**; as fases posteriores (contrato de regras antes de V01-05, ADR 3D antes de V01-07) registram-se nos seus próprios ADR/histórias com o seu próprio grafo. Este plano registra o **mapa de continuação** V01 (seção seguinte) para deixar claro o caminho, sem comprometer datas nem prometer jogo entregue.

---

## Critérios verificáveis

### Mapa LOB → tarefas TDD → continuação V01

| LOB (fatia) | Tarefas que o cobrem | Continuação para V01 |
|---|---|---|
| LOB-01 | TDD-03, TDD-05, TDD-10, TDD-11, TDD-12 | alimenta V01-01 |
| LOB-02 | TDD-06, TDD-09, TDD-12 | alimenta V01-02 |
| LOB-03 | TDD-07, TDD-13 | alimenta V01-03 |
| LOB-04 | TDD-07, TDD-15 | alimenta V01-03 |
| LOB-05 | TDD-02, TDD-03, TDD-11 | alimenta V01-01 |
| LOB-06 | TDD-08, TDD-09, TDD-13, TDD-14, TDD-16 | alimenta V01-08 |
| LOB-07 | TDD-17, TDD-18, TDD-19, TDD-20, TDD-21 | alimenta V01-09, V01-10 |

| Critério completo (v0.1) | Como se alcança a partir desta fatia |
|---|---|
| V01-01 | Apelido + 2 sessões: TDD-03, TDD-11, TDD-17 (fatia) — completo quando a partida e o 3D existirem |
| V01-02 | Criar/listar atualização sem recarregar: TDD-05/06/09/12 |
| V01-03 | Entrar/capacidade/concorrência: TDD-07, TDD-15 |
| V01-04 | Ações fora de turno rejeitadas pelo servidor → requer regras (fase posterior, antes de V01-05) |
| V01-05 | Regras Truco Paulista → contrato de produto + ADR de regras (posterior) |
| V01-06 | Cartas privadas sem exposição → fase posterior (privacidade de regras) |
| V01-07 | Mesa/cartas/jogadores/braços/mãos em 3D → ADR 3D + fase posterior |
| V01-08 | Estados de espera/erro/desconexão/fim claros, reconexão/encerramento → TDD-08, TDD-09, TDD-13, TDD-14, TDD-16 (fatia) + lógica de partida/fim (posterior) |
| V01-09 | Regressão dos navegadores + revisão independente + CI/QA mesmo commit → TDD-17, TDD-18, TDD-21 |
| V01-10 | URL local, serviços saudáveis, logs, procedimento de acesso e rollback comprovado → TDD-19, TDD-20 |

### Grafo TDD proposto (DAG)

Formato: `TDD-XX — título | autor → revisor | depende de: TDD-YY, TDD-ZZ ou — | verificação: critérios`. **Revisores sempre de perfil distinto ao autor**, conforme a matriz canônica (D1). Autor e revisor usam IDs canônicos (`backend_data`, `quality_security`, etc.), nunca aliases.

**Base / banco / contrato**
- **TDD-01** — Repo monorepo (`server/`, `web/`, `shared/`), esqueleto Compose, `migrate`, healthchecks | backend_data → techlead | depende de: — | verificação: esqueleto compilando, Compose sobe `postgres` + `migrate` com healthcheck verde; CI local mínima `lint`; regressão sem borrar etapas prévias.
- **TDD-02** — Contrato de tipos compartilhados `shared/` (endpoints, eventos WS, códigos de erro, envelopes) | backend_data → techlead | depende de: TDD-01 | verificação: unit de serialização/deserialização de todos os códigos e envelopes (Red → Green → regressão); sem lógica, só contrato exportado e consumível.
- **TDD-03** — Sessão sem autenticação: `POST /api/session`, cookie HttpOnly token 256 bits, validação e normalização do apelido (trim, 1–20 inclusivo) | backend_data → techlead | depende de: TDD-01 | verificação: unit LOB-05 (vazio após trim → 422 `NICKNAME_EMPTY`, >20 → 422 `NICKNAME_INVALID`, 20 válido); integração create session 201 + cookie set; Green depois do Red, regressão mantida.
- **TDD-04** — Esquema e migrações `rooms` (id, assentos, host, participante, created_at, heartbeat) | backend_data → techlead | depende de: TDD-01 | verificação: `migrate` aplica sobre Postgres limpo e sobre re-executação sem quebrar; teste de migração/rollback idempotente (Red → Green → regressão).

**Lobby funcional (backend_data)**
- **TDD-05** — Criar sala `POST /api/rooms` (o criador ocupa o assento 1); 409 `SESSION_ALREADY_IN_ROOM` | backend_data → techlead | depende de: TDD-03, TDD-04 | verificação: integração 201 com id e estado `aguardando`; re-criação de sessão já em sala → 409 LOB-01 (Red → Green → regressão).
- **TDD-06** — Listar salas que aguardam `GET /api/rooms` + subscrição WS `room_list_updated` | backend_data → techlead | depende de: TDD-05 | verificação: integração lista só com vaga livre; evento emitido ao mudar a lista LOB-02 (Red → Green → regressão).
- **TDD-09** — Eventos WS: `room_list_updated`, `room_updated`, `session_invalid`; `seq` monotônico; resync idempotente por `GET` | backend_data → techlead | depende de: TDD-06 | verificação: integração emissão de eventos por mutação; lacuna de `seq` detectável; resync idempotente após reconexão (Red → Green → regressão).
- **TDD-07** — Entrar na última vaga `POST /api/rooms/:id/join` atômico (`SELECT ... FOR UPDATE`) | backend_data → techlead | depende de: TDD-05, TDD-09 | verificação: LOB-04 — 2 joins concorrentes → exatamente 1 sucesso + 1 `409 ROOM_FULL`; terceiro bloqueado; sala fica com 2 assentos (Red → Green → regressão).
- **TDD-08** — Sair/cancelar `POST /api/rooms/:id/leave` + política timeout/abandono (heartbeat 10s, ausência 30s libera assento) | backend_data → techlead | depende de: TDD-05, TDD-09 | verificação: LOB-06 — o convidado que sai libera o assento 2 e a sala volta a "aguardando"; host ausente 30s cancela a sala (teste de integração com clock controlado); nunca sala falsa disponível indefinidamente (Red → Green → regressão).

**Frontend (React + TypeScript + Vite)**
- **TDD-10** — Esqueleto frontend: router de estados do lobby, proxy `/api` e `/ws`, cliente HTTP | frontend → techlead | depende de: TDD-01, TDD-02 | verificação: esqueleto roda em dev contra o `server`; navega entre estados vazio/carregando (design states) sem renderização 3D (bundle sem Three.js); regressão mantida.
- **TDD-11** — Tela de apelido: validação 1–20, erro em texto puro sem execução HTML/script, a11y (`aria-describedby`, `aria-live`), estados vazio/carregando/erro | frontend → techlead | depende de: TDD-10 | verificação: unit de validação client; E2E apelido inválido mostra texto seguro, nunca executa `<script>` LOB-05; navegável por teclado; contraste WCAG AA (Red → Green → regressão).
- **TDD-12** — Criar sala + vista de espera (ID visível, "aguardando 2º") + lista de salas disponíveis com atualização WS sem recarregar | frontend → techlead | depende de: TDD-10, TDD-06, TDD-09 | verificação: E2E LOB-01/02 — A cria, B (contexto independente) vê a sala sem recarregar; apelidos iguais como linhas independentes; alvo ≥ 44×44 (Red → Green → regressão).
- **TDD-13** — Sala completa: dois participantes visíveis, terceiro rejeitado com mensagem clara, estados `sala-removida`/`conexao-perdida`, sem botão de jogo | frontend → techlead | depende de: TDD-10, TDD-07, TDD-08 | verificação: E2E LOB-03/04/06 — A e B veem "sala completa"; terceiro vê sala cheia/indisponível; estados de desconexão claros sem "aguardando" em sala falsa; transição pré-jogo sem botão de jogo (Red → Green → regressão).
- **TDD-14** — Cliente WS com reconexão (backoff 500ms → dobra → teto 5s), re-subscrição, detecção de lacuna `seq` e resync | frontend → techlead | depende de: TDD-10, TDD-09 | verificação: E2E simulando corte de rede → reconexão e resync sem estado dessincronizado; `session_invalid` devolve ao apelido com mensagem clara (Red → Green → regressão).

**Integração / E2E / CI / QA**
- **TDD-15** — Teste de integração determinista da última vaga (2 joins concorrentes) | quality_security → techlead | depende de: TDD-03, TDD-05, TDD-07 | verificação: exatamente 1 sucesso + 1 `409 ROOM_FULL`; sala final=2 LOB-04 (Red → Green → regressão).
- **TDD-16** — Teste de integração timeout/abandono com clock controlado | quality_security → techlead | depende de: TDD-08 | verificação: a sala não permanece disponível falsamente após ausência; vaga liberada ao sair/convidado ausente LOB-06 (Red → Green → regressão).
- **TDD-17** — Suite E2E Playwright em dois `BrowserContext` independentes (Chrome) + execução em Firefox | quality_security → techlead | depende de: TDD-11, TDD-12, TDD-13, TDD-14 | verificação: fluxos LOB-01..06 completos em ambos contextos; apelido seguro; terceiro bloqueado; corrida pela última vaga; evidência com capturas (referidas ao mesmo commit) (Red → Green → regressão).
- **TDD-18** — CI local Compose: `lint → unit → integration → e2e` | devops → quality_security | depende de: TDD-15, TDD-16, TDD-17 | verificação: o serviço `ci` roda a suíte completa no stack do Compose e emite recibo/evidência reutilizável; CI por `pull_request` real permanece pendência técnica a fechar antes da implementação.

**Deploy / QA**
- **TDD-19** — Compose local saudável, healthchecks, URL local acessível, logs e procedimento de acesso | devops → quality_security | depende de: TDD-18 | verificação: `docker compose up` com todos os serviços health; URL acessível; logs disponíveis (V01-10 parcial) (Green + regressão).
- **TDD-20** — Procedimento e evidência de rollback (tags fixas `release/v0.1`, recriar a partir de snapshot anterior) | devops → quality_security | depende de: TDD-18 | verificação: rollback executado e comprovado com evidência do passo (V01-10) (regressão verde após o passo).
- **TDD-21** — Revisão independente QA final em dois navegadores + registro de evidência do mesmo commit | quality_security → techlead | depende de: TDD-19, TDD-20 | verificação: fluxos da fatia passam nos dois navegadores com capturas; CI e QA referenciam o mesmo commit revisado de forma independente (V01-09); relatório cobre todos os critérios do lobby (regressão completa sem teste enfraquecido).

### Garantia de aciclicidade e limites

- **Aciclicidade pela ordem topológica das dependências explícitas:** cada tarefa declara explicitamente suas dependências; a propriedade acíclica verifica-se pela **ordem topológica derivada dessas declarações**, não pela numeração do ID local. O ID numérico é apenas identificador local e não implica ordem de execução: por exemplo, TDD-09 (eventos WS) tem número maior que TDD-07/TDD-08, mas **é dependência** delas (TDD-07 e TDD-08 dependem de TDD-09, que por sua vez depende de TDD-06). A ordem válida de execução é qualquer **ordem topológica** das arestas declaradas (ex.: ..., TDD-06, TDD-09, TDD-05 → TDD-07, TDD-08, ...), garantindo que nenhuma tarefa se executa antes de fecharem todas as suas dependências. Isso garante um **DAG sem ciclos**.
- **Concorrência:** máximo 2 workers simultâneos e 1 por perfil. A sequenciação por perfil evita que um perfil tenha duas tarefas ativas ao mesmo tempo (ver D1); revisores de perfil distinto garantem que ninguém revise o próprio trabalho.
- **TDD:** cada tarefa funcional começa com seu teste Vermelho, passa a Verde com a implementação mínima e permanece em Regression sem apagar/enfraquecer provas anteriores.

---

## Riscos e pendências

| # | Risco/pendência | Mitigação / responsável |
|---|---|---|
| R1 | **Atomicidade da última vaga** quebrada em produção se a transação `FOR UPDATE` não estiver bem implementada. | TDD-15 obrigatório no gate; revisão independente; teste concorrente determinista (LOB-04). |
| R2 | Reconexão com lacuna de eventos causa estado dessincronizado. | Resync idempotente por `GET` + detecção de lacuna `seq` (TDD-09/TDD-14). |
| R3 | Postgres adiciona componente e migrações à fatia. | Migrações versionadas antes do `server`; healthcheck; rollback por tag fixa (TDD-04/TDD-20). |
| R4 | `ws` nativo sem reconexão embutida aumenta trabalho do cliente. | Política documentada e testada (TDD-14); alternativa Socket.IO revisitada se o custo subir. |
| R5 | **CI por `pull_request` real não comprovada:** a execução atual é `workflow_dispatch` (manual), cujo passo `pull_request`-only é omitido em dispatch; verde em dispatch não prova esse evento. | Reproduzir o gate completo em evento `pull_request` real como **pendência técnica** antes da implementação; não declarar CI de PR concluída neste plano. |
| R6 | Cookie HttpOnly + WS na mesma origem exige servir estático pelo `server`. | Build de origem única (TDD-01/TDD-10); validado em E2E. |
| R7 | Sem autenticação, qualquer navegador cria sessão; abuso/rate. | `RATE_LIMITED` no contrato; limitação por IP/rota na fatia, registrada para QA. |
| R8 | "Sala completa" mal interpretada como partida entregue. | Estado "completa" sem botão de jogo; brief mantém v0.1 ATIVA (D6). |
| R9 | Desempenho (1s p95 / 30 FPS) são **metas não medidas** do brief. | Não declarar como evidência; QA mede e registra método (hardware/navegadores/carga) quando as fatias correspondentes existirem. |
| P1 | **Bloqueio de execução:** pré-condições operacionais do brief (recibo deepseek ds1, contrato Qwen, gates/supervisor do board, ferramentas fechadas da fixture) **não estão declaradas concluídas**. | Confirmadas pelos perfis responsáveis **antes** de liberar a primeira card TDD-01; este grafo não as declara cumpridas. |
| P2 | Validação de worktrees/PRs e **integração de documentos por PR** (histórias `t_10ca48e7`, ADR `t_66a7d8ef`, design `t_fd99c33d`, este grafo) ainda não realizada; CI por `pull_request` real pendente. | Gate D5: validar worktrees/PRs e integrar os documentos em `release/v0.1` por PR revisado, e fechar a CI real, **antes** de qualquer implementação; este plano **não declara** produto, worktrees ou governança integrados. |
| P3 | Decisão da engine 3D e contrato de regras (manilhas, empates, escalada, mão de onze/ferro, abandono em partida). | ADRs/histórias posteriores; não bloqueiam o lobby; produto apresenta contrato antes de V01-05 (ADR P2 / histórias). |
| P4 | Rollback ainda não comprovado nesta fase de planejamento. | Procedimento definido (TDD-20); evidência de rollback é requisito do gate LOB-07 (V01-10). |
| P5 | Concorrência do grafo (máx. 2 workers / 1 por perfil) exige disciplina de sequenciação. | Ordem topológica DAG do grafo (pelas dependências explícitas, não pela numeração); nenhum perfil com duas tarefas ativas; revisores de perfil distinto (matriz canônica D1). |
| P6 | **Invariante de ordem mal documentado:** afirmar que "cada tarefa depende só de IDs com número menor" é falso (TDD-07/TDD-08 dependem de TDD-09). | Corrigido aqui: a aciclicidade baseia-se nas **dependências explícitas** (ordem topológica), não na numeração; TDD-09 declara-se antes de TDD-07/TDD-08 na listagem para evitar que sejam executadas antes de sua dependência. |

**Pendência de revisão:** este grafo proposto envia-se à revisão independente (CTO). Nenhum código, PR, deploy ou release é executado por este planejamento; a execução permanece bloqueada conforme D5.