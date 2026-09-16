# PLAN.md — Grafo TDD proposto para a primeira fatia do Truco Online v0.1

**Tarefa:** t_83fc342c
**Perfil:** techlead (AUTHOR)
**Brief de referência:** BRIEF-TRUCO-v0.1-R1-20260916
**SHA-256 do brief:** `273d7760dc25b2641631a98a8d3aef352883d4a92469c145154285e9dd17d403`
**Dependências revisadas (aprovadas):**
- `t_10ca48e7` — Produto: histórias LOB-01..07 (Given/When/Then)
- `t_75520b49` — CTO: ADR `ADR-TRUCO-V0.1-LOBBY-R1` (stack, protocolo, erros, atomicidade, reconexão, Compose)
- `t_97deb23b` — Design: UX do lobby (estados, wireframes, a11y, responsividade)

**Natureza deste documento:** consolidação das histórias/ADR/design aprovados num **grafo TDD proposto**. **Não** cria nem executa cards de implementação. **Não** implementa, **não** abre PR/merge, **não** faz deploy, **não** publica release. Termina na entrega terminal. As decisões técnicas pertencem ao CTO/Tech Lead (não ao CEO).

---

## Objetivo

Consolidar as histórias de produto (LOB-01..07), o ADR técnico e o design de UX num **grafo de tarefas TDD proposto**, pequeno e com **IDs locais**, onde cada tarefa declara: responsável, revisor independente, dependências **acíclicas**, contrato de API e verificação **Red/Green/TDD** com testes unitários, de integração, E2E, QA e deploy. O grafo:

1. Mapea cada **LOB-01..07** a tarefas concretas do lobby (fatia).
2. Regista como a **v0.1 completa** continuará até **V01-01..10**, deixando constância de que **o lobby não encerra o release** (a v0.1 permanece ATIVA até cumprir a versão completa).
3. **Explicita o bloqueo de execução**: nenhun card é executado até (a) validar o mecanismo de worktrees/PRs e (b) integrar estes documentos aprovados por PR.
4. Documenta os **marcos de decisión técnica** (contrato API, políticas de timeout/identidade, atomicidade da última vaga, reconexión) já decididos no ADR, sem reabrir discusión de produto.

**Fora do escopo desta entrega:** calquera implementación, creación/execución de cards de implementación, PR/merge, deploy, release, renderizado 3D e reglas de Truco Paulista (V01-05/06/07).

---

## Decisões

### D1 — Formato do grafo: tarefas pequenas com IDs locais, responsável e revisor independentes

Cada tarefa identifícase cun ID local `TDD-XX`, atribúese a un **único responsável** (perfil) e a un **revisor independente** de perfil distinto (ninguén revisa o seu propio traballo). O grafo é un **DAG** (dependencias acíclicas). Respéitanse os límites do brief: **9 perfiles, máximo 2 workers simultáneos e 1 por perfil**; o grafo secuencia para non superar esa concorrencia por perfil.

Perfiles usados na fatia: `backend`, `frontend`, `devops`, `qa`, `techlead`, `designer`, `cto`. `produto` xa entregou as historias. `mobile` queda sen implementación na v0.1.

### D2 — Contrato de API e protocolo: tómase do ADR, sen reabrir decisión

O contrato fíxase como **contrato de tipos compartidos** (paquete `shared/`) entre servidor e web, derivado do ADR D4/D5:

**Endpoints REST (comandos, mutacións atómicas con status HTTP):**

| Método/rota | Descrición | Respostas |
|---|---|---|
| `POST /api/session` | Crea sesión desde o apelido (valida LOB-05). | 201; 422 `NICKNAME_EMPTY`/`NICKNAME_INVALID` |
| `GET /api/rooms` | Lista salas agardando 2º (vaga libre). | 200 lista |
| `POST /api/rooms` | Crea sala; o creador ocupa o asento 1. | 201 room; 409 `SESSION_ALREADY_IN_ROOM` |
| `POST /api/rooms/:id/join` | Entra na última vaga, atómicamente. | 200 room; 404 `ROOM_NOT_FOUND`; 409 `ROOM_FULL`; 403 `SESSION_ALREADY_IN_ROOM` |
| `POST /api/rooms/:id/leave` | Sair / cancelar sala. | 204; 404 `ROOM_NOT_FOUND` |
| `GET /api/rooms/:id` | Estado actual dunha sala (resync/reconexión). | 200 room; 404 `ROOM_NOT_FOUND` |

**Eventos WebSocket (push):** envelope `{ type, seq, data }`; tipos `room_list_updated`, `room_updated`, `session_invalid`. `seq` monotónico por sesión para detectar lagoas e resincronizar.

**Contrato de erros unificado (HTTP e WS):** envelope JSON `{ error: { code, message, requestId } }` (HTTP, con status canónico) e `{ type: "error", data: { code, message } }` (WS). Códigos: `NICKNAME_EMPTY`, `NICKNAME_INVALID`, `SESSION_INVALID`, `SESSION_ALREADY_IN_ROOM`, `ROOM_NOT_FOUND`, `ROOM_FULL`, `INVALID_OPERATION`, `RATE_LIMITED`. Mensaxes exíbense como **texto puro**, nunca como HTML/script (LOB-05).

**Identidade/tempo (ADR D3/D7):** cookie `HttpOnly` con id de sesión cripto-aleatorio (256 bits) `SameSite=Lax`; o apelido non identifica a sesión; heartbeat WS cada 10s; ausencia de 30s marca a conexión morta e libera o recurso; reconexión do cliente con backoff exponencial (500ms→2×→tope 5s) e resync idempotente por `GET`. Capacidade de sala = 2 aplicada no servidor con `SELECT ... FOR UPDATE` dentro dunha transacción (atomicidade da última vaga, LOB-04).

**Alternativas avaliadas e descartadas no ADR** (non se reabren aquí, **ratifícanse**): Socket.IO (protocolo opaco frente a frames JSON explícitos), estado só en memoria/Redis (perde durabilidade e atomicidade transaccional), identidade por apelido (contradice LOB-05), polling HTTP puro (viola "sen recargar"). Queda **pendente** a engine 3D e o contrato de regras (ADR P2), para ADRs posteriores antes de V01-05/07.

### D3 — Estratexia TDD en tres capas (Red→Green→Regression)

Para cada tarefa funcional: escribir primeiro o **test que falla** (Red), implementar o mínimo para pasalo (Green) e manter a suite en **Regression** verde sen borrar/enflaquecer probas previas (asínálase en todas as tarefas). Capas:

1. **Unitario (Vitest):** validación do apelido (LOB-05), mapeo de códigos de erro, lóxica de asentos e regras puras.
2. **Integración (Vitest + supertest contra Postgres real do Compose):** create/list/join/leave, contrato de erros, **atomicidade da última vaga** (2 joins concurrentes → 1 éxito + 1 `409 ROOM_FULL`), timeout de sala con clock controlado (LOB-06), reconexión/resync/lagoa de `seq`.
3. **E2E (Playwright, chromium ARM64):** dous `BrowserContext` independentes (os dous navegadores), terceiro bloqueado, carreira pola última vaga, apelido baleiro rexeitado con exibición segura.

### D4 — Compose e CI local ARM64

Servizos: `postgres` (17-alpine), `migrate` (node:22-alpine, migracións versionadas antes do `server`), `server` (node:22-alpine; serve o build estático do `web` nunha única orixe para cookie HttpOnly e WS sen CORS), `web` (dev server Vite con proxy `/api` e `/ws`; build estático en prod servido polo `server`), `ci` (lint→unit→integration→e2e, one-off), `e2e` (Playwright). **Rollback** por tags de imaxe fixas por release (`release/v0.1`): reverter tag/commit e recrear o compose desde o snapshot anterior, con paso comprobado en evidencia. Sen servizos pagados/cloud (ADR D10, CV-10).

### D5 — Bloqueo de execución e gates (explícito)

Este documento é un **grafo proposto**, non autorización de execución. **A execución queda bloqueada** ata que se cumpran, de forma verificable:

1. **Validación de worktrees/PRs:** validar despacho, worktrees, GitHub, revisión e límites **sen liberar cards** de implementación, conforme ás pre-condicións operacionais do brief (vincular recibo do ensaio deepseek ds1, actualizar o contrato que esixe Qwen, trocar o scope de gateways/supervisor ao board de produto, configurar gates propios do produto — as ferramentas fechadas da fixture HTTP non abondan).
2. **Integración de documentos por PR:** as historias (`t_10ca48e7`), o ADR (`t_75520b49`), o design (`t_97deb23b`) e este grafo intégranse en `release/v0.1` **por PR revisado** (main só recibe fundación/gobernanza por PR revisado). Ningún card do grafo TDD arrinca antes desa integración.
3. **Confirmación de pre-condicións:** as pre-condicións operacionais do brief **non están declaradas concluídas por este documento**; deben confírmalas os perfiles responsables antes da primeira card de implementación.

### D6 — O lobby non pecha o release

Concluír LOB-01..07 é un **marco intermedio**. A v0.1 completa esixe ademais V01-04..07 (regras, privacidade de cartas, 3D). O estado "sala completa" **non** despregua botón de xogo simulado; a transición pre-xogo é só o límite da fatia. O grafo TDD proposto aquí entrega a **fatia de lobby**; as fases posteriores (contrato de regras ante V01-05, ADR 3D ante V01-07) rexistraranse nos seus propios ADR/historias co seu propio grafo. Este plan rexistra o **mapa de continuación** V01 (sección seguinte) para que quede claro o camiño, sen comprometer datas nin prometer xogo entregado.

---

## Critérios verificáveis

### Mapa LOB → tarefas TDD → continuación V01

| LOB (fatia) | Tarefas que o cobren | Continuación cara V01 |
|---|---|---|
| LOB-01 | TDD-03, TDD-05, TDD-10, TDD-11, TDD-12 | alimenta V01-01 |
| LOB-02 | TDD-06, TDD-09, TDD-12 | alimenta V01-02 |
| LOB-03 | TDD-07, TDD-13 | alimenta V01-03 |
| LOB-04 | TDD-07, TDD-15 | alimenta V01-03 |
| LOB-05 | TDD-02, TDD-03, TDD-11 | alimenta V01-01 |
| LOB-06 | TDD-08, TDD-09, TDD-13, TDD-14, TDD-16 | alimenta V01-08 |
| LOB-07 | TDD-17, TDD-18, TDD-19, TDD-20, TDD-21 | alimenta V01-09, V01-10 |

| Criterio completo (v0.1) | Como se alcanza desde esta fatia |
|---|---|
| V01-01 | Apelido + 2 sesións: TDD-03, TDD-11, TDD-17 (fatia) — completo cando a partida e o 3D existan |
| V01-02 | Crear/listar actualización sen recargar: TDD-05/06/09/12 |
| V01-03 | Entrar/capacidade/concorrencia: TDD-07, TDD-15 |
| V01-04 | Accións fóra de turno rexeitadas polo servidor → require regras (fase posterior, antes de V01-05) |
| V01-05 | Regras Truco Paulista → contrato de produto + ADR de regras (posterior) |
| V01-06 | Cartas privadas sen exposición → fase posterior (privacidade de regras) |
| V01-07 | Mesa/cartas/xogadores/brazos/mans en 3D → ADR 3D + fase posterior |
| V01-08 | Estados de espera/erro/desconexión/fin claros, reconexión/peche → TDD-08, TDD-09, TDD-13, TDD-14, TDD-16 (fatia) + lóxica de partida/fin (posterior) |
| V01-09 | Regresión dos navegadores + revisión independente + CI/QA mesmo commit → TDD-17, TDD-18, TDD-21 |
| V01-10 | URL local, servizos sans, logs, procedemento de acceso e rollback comprobado → TDD-19, TDD-20 |

### Grafo TDD proposto (DAG)

Formato: `TDD-XX — título | responsable → revisor | depende de | verificación`. **Revisores sempre de perfil distinto ao responsable.**

**Base / banco / contrato**
- **TDD-01** — Repo monorepo (`server/`, `web/`, `shared/`), esqueleto Compose, `migrate`, healthchecks | backend → devops | depende de: — (raíz) | Directrices e verificación: esqueleto compilando, Compose levanta `postgres`+`migrate` con healthcheck verde; CI local mínimo `lint`.
- **TDD-02** — Contrato de tipos compartidos `shared/` (endpoints, eventos WS, códigos de erro, envelopes) | backend → frontend | depende de: TDD-01 | Directriz/verificación: unit de serialización/deserialización de todos os códigos e envelopes; sen implementación de lóxica, só contrato exportado e consumible.
- **TDD-03** — Sesión sen autenticación: `POST /api/session`, cookie HttpOnly token 256 bits, validación e normalización do apelido (trim, 1–20 inclusivo) | backend → techlead | depende de: TDD-01 | Verificación Red/Green: unit LOB-05 (baleiro tras trim→422 `NICKNAME_EMPTY`, >20→422 `NICKNAME_INVALID`, 20 válido); integración create session 201 + cookie set.
- **TDD-04** — Esquema e migracións `rooms` (id, asentos, host, participante, created_at, heartbeat) | backend → devops | depende de: TDD-01 | Verificación: `migrate` aplica sobre Postgres limpo e sobre re-execución sen romper; test de migración/rollback idempotente.

**Lobby funcional (backend)**
- **TDD-05** — Crear sala `POST /api/rooms` (o creador ocupa o asento 1); 409 `SESSION_ALREADY_IN_ROOM` | backend → techlead | depende de: TDD-03, TDD-04 | Verificación: integración 201 con id e estado `agardando`; re-creación de sesión xa en sala → 409 LOB-01.
- **TDD-06** — Listar salas que agardan `GET /api/rooms` + suscripción WS `room_list_updated` | backend → frontend | depende de: TDD-05 | Verificación: integración lista só vaga libre; evento emitido ao cambiar a lista LOB-02.
- **TDD-09** — Eventos WS: `room_list_updated`, `room_updated`, `session_invalid`; `seq` monotónico; resync idempotente por `GET` | backend → frontend | depende de: TDD-06 | Verificación: integración emisión de eventos por mutación; lagoa de `seq` detectable; resync idempotente tras reconexión.
- **TDD-07** — Entrar na última vaga `POST /api/rooms/:id/join` atómico (`SELECT ... FOR UPDATE`) | backend → techlead | depende de: TDD-05, TDD-09 | Verificación: LOB-04 — 2 joins concurrentes → exactamente 1 éxito + 1 `409 ROOM_FULL`; terceiro bloqueado; sala queda con 2 asentos.
- **TDD-08** — Sair/cancelar `POST /api/rooms/:id/leave` + política timeout/abandono (heartbeat 10s, ausencia 30s libera asento) | backend → devops | depende de: TDD-05, TDD-09 | Verificación: LOB-06 — o invitado que sae libera o asento 2 e a sala volta a "agardando"; host ausente 30s cancela a sala (test de integración con clock controlado); nunca sala falsa dispoñible indefinidamente.

**Frontend (React + TypeScript + Vite)**
- **TDD-10** — Esqueleto frontend: router de estados do lobby, proxy `/api` e `/ws`, cliente HTTP | frontend → designer | depende de: TDD-01, TDD-02 | Verificación: esqueleto corre en dev contra o `server`; navega entre estados baleiro/cargando (design states) sen renderizado 3D (bundle sen Three.js).
- **TDD-11** — Pantalla de apelido: validación 1–20, erro en texto puro sen execución HTML/script, a11y (`aria-describedby`, `aria-live`), estados baleiro/cargando/erro | frontend → designer | depende de: TDD-10 | Verificación: unit de validación client; E2E apelido inválido mostra texto seguro, nunca executa `<script>` LOB-05; navegable por teclado; contraste WCAG AA.
- **TDD-12** — Crear sala + vista de espera (ID visible, "agardando 2º") + lista de salas dispoñibles con actualización WS sen recargar | frontend → backend | depende de: TDD-10, TDD-06, TDD-09 | Verificación: E2E LOB-01/02 — A crea, B (contexto independente) ve a sala sen recargar; apelidos iguais como filas independentes; target ≥44×44.
- **TDD-13** — Sala completa: dous participantes visibles, terceiro rexeitado con mensaxe clara, estados `sala-removida`/`conexao-perdida`, sen botón de xogo | frontend → designer | depende de: TDD-10, TDD-07, TDD-08 | Verificación: E2E LOB-03/04/06 — A e B ven "sala completa"; terceiro ve sala chea/indispoñible; estados de desconexión claros sen "agardando" en sala falsa; transición pre-xogo sen botón de xogo.
- **TDD-14** — Cliente WS con reconexión (backoff 500ms→2×→tope 5s), re-suscripción, detección de lagoa `seq` e resync | frontend → backend | depende de: TDD-10, TDD-09 | Verificación: E2E simulando cortada de rede → reconexión e resync sen estado desincronizado; `session_invalid` devolve ao apelido con mensaxe clara.

**Integración / E2E / CI**
- **TDD-15** — Test de integración determinista da última vaga (2 joins concurrentes) | qa → backend | depende de: TDD-03, TDD-05, TDD-07 | Verificación: exactamente 1 éxito + 1 `409 ROOM_FULL`; sala final=2 LOB-04.
- **TDD-16** — Test de integración timeout/abandono con clock controlado | qa → devops | depende de: TDD-08 | Verificación: a sala non permanece dispoñible falsamente tras ausencia; vaga liberada ao saír/invitado ausente LOB-06.
- **TDD-17** — Suite E2E Playwright en dous `BrowserContext` independentes (Chrome) + execución en Firefox | qa → frontend | depende de: TDD-11, TDD-12, TDD-13, TDD-14 | Verificación: fluxos LOB-01..06 completos en ambos contextos; apelido seguro; terceiro bloqueado; carreira pola última vaga; evidencia con capturas (referidas ao mesmo commit).
- **TDD-18** — CI local Compose: `lint → unit → integration → e2e` | devops → techlead | depende de: TDD-15, TDD-16, TDD-17 | Verificación: o servizo `ci` corre a suite completa no stack do Compose e emite recibo/evidencia reutilizable.

**Deploy / QA**
- **TDD-19** — Compose local san, healthchecks, URL local accesible, logs e procedemento de acceso | devops → qa | depende de: TDD-18 | Verificación: `docker compose up` con todos os servizos health; URL accesible; logs dispoñibles (V01-10 parcial).
- **TDD-20** — Procedemento e evidencia de rollback (tags fixas `release/v0.1`, recrear desde snapshot anterior) | devops → techlead | depende de: TDD-18 | Verificación: rollback executado e comprobado con evidencia do paso (V01-10).
- **TDD-21** — Revisión independente QA final en dous navegadores + rexistro de evidencia do mesmo commit | qa → cto | depende de: TDD-19, TDD-20 | Verificación: fluxos da fatia pasan nos dous navegadores con capturas; CI e QA referencian o mesmo commit revisado de forma independente (V01-09); reporte cobre todos os criterios do lobby.

### Certeza de aciclicidade e límites

- **Aciclicidade pola orde topolóxica das dependencias explícitas:** cada tarefa declara explicitamente as súas dependencias; a propiedade acíclica verifícase pola **orde topolóxica derivada desas declaracións**, non pola numeración do ID local. O ID numérico é só un identificador de tarefa (local) e non implica orde de execución: por exemplo, TDD-09 (eventos WS) ten número maior ca TDD-07/TDD-08, pero é **dependencia** delas (TDD-07 e TDD-08 dependen de TDD-09). A orde válida de execución é calquera **orde topolóxica** das arestas declaradas (ex.: ..., TDD-06, TDD-09, TDD-05→TDD-07, TDD-08, ...), garantindo que ningunha tarefa se executa antes de que pechen todas as súas dependencias. Isto garante un **DAG sen ciclos**.
- **Concurrencia:** máximo 2 workers simultáneos e 1 por perfil. A secuenciación por perfil evita que un perfil teña dúas tarefas activas á vez; os reviewers de perfil distinto garantizan que ninguén revise o seu propio traballo.
- **TDD:** cada tarefa funcional empeza co seu test Vermello, pasa a Verde coa implementación mínima e queda en Regression sen borrar/enflaquecer probas previas.

---

## Riscos e pendências

| # | Risco/pendencia | Mitigación / responsable |
|---|---|---|
| R1 | **Atomicidade da última vaga** rota en produción se a transacción `FOR UPDATE` non está ben implementada. | TDD-15 obrigatorio no gate; revisión independente; test concurrente determinista (LOB-04). |
| R2 | Reconexión con lagoa de eventos causa estado desincronizado. | Resync idempotente por `GET` + detección de lagoa `seq` (TDD-09/TDD-14). |
| R3 | Postgres engade componente e migracións á fatia. | Migracións versionadas antes do `server`; healthcheck; rollback por tag fixa (TDD-04/TDD-20). |
| R4 | `ws` nativo sen reconexión embebida aumenta traballo do cliente. | Política documentada e probada (TDD-14); alternativa Socket.IO revisitada se o custo sube. |
| R5 | Cookie HttpOnly + WS na mesma orixe esixe servir estático polo `server`. | Build de orixe única (TDD-01/TDD-10); validado en E2E. |
| R6 | Sen autenticación, calquera navegador crea sesión; abuso/rate. | `RATE_LIMITED` no contrato; limitación por IP/ruta na fatia, rexistrada para QA. |
| R7 | "Sala completa" malinterpretada como partida entregue. | Estado "completa" sen botón de xogo; brief mantén v0.1 ACTIVA (D6). |
| R8 | Desempeño (1s p95 / 30 FPS) son **metas non medidas** do brief. | Non declarar como evidencia; QA mide e rexistra método (hardware/navegadores/carga) cando as fatias correspondentes existan. |
| P1 | **Bloqueo de execución**: pre-condicións operacionais (recibo deepseek ds1, contrato Qwen, gates/supervisor do board, ferramentas fechadas da fixture) **non están declaradas concluídas**. | Confirmadas polos perfiles responsables **antes** de liberar a primeira card TDD-01; este grafo non as declara cumpridas. |
| P2 | Validación de worktrees/PRs e integración de documentos por PR aínda non realizada. | Gate D5: validar worktrees/PRs e fusionar `t_10ca48e7`/`t_75520b49`/`t_97deb23b`/este grafo en `release/v0.1` por PR revisado antes de calquera implementación. |
| P3 | Decisión da engine 3D e contrato de reglas (manillas, empates, escalada, man de once/ferro, abandono en partida). | ADRs/historias posteriores; non bloquean o lobby; produto presenta contrato antes de V01-05 (ADR P2 / historias). |
| P4 | Rollback aínda non comprobado nesta fase de planeamento. | Procedemento definido (TDD-20); evidencia de rollback é requisito do gate LOB-07 (V01-10). |
| P5 | Concurrencia do grafo (máx. 2 workers / 1 por perfil) esixe disciplina de secuenciación. | Orde topolóxica DAG do grafo (polas dependencias explícitas, non pola numeración); ningún perfil con dúas tarefas activas; revisores de perfil distinto. |
| P6 | **Invariante de orde mal documentado:** afirmar que "cada tarefa depende só de IDs con número menor" é falso (TDD-07/TDD-08 dependen de TDD-09). | Corrixido aquí: a aciclicidade baséase nas **dependencias explícitas** (orde topolóxica), non na numeración; TDD-09 declárase antes de TDD-07/TDD-08 na listaxe para evitar levalos a executar antes da súa dependencia. |

**Pendencia de revisión:** este grafo proposto envíase a revisión independente (CTO). Ningún código, PR, deploy ou release se executa por este planeamento; a execución permanece bloqueada conforme a D5.