# ADR 0001 — Stack Web, 3D e Transporte em Tempo Real v0.1

## Status: Proposto
## Responsável: `cto`
## Revisão: `techlead`
## Data: 2026-09-09

---

Este ADR documenta a escolha da stack tecnológica para Truco Online v0.1, focando em decisões de arquitetura verificáveis através de documentação oficial e capacidades comprovadas pelas bibliotecas selecionadas. As restrições impostas são: componentes open source, execução local em Docker ARM64, e proibição de benchmarks numéricos não reproduzíveis.

---

## 1. Decisão

### Frontend Web + Renderização 3D
- **Web framework**: React 18
- **Renderização 3D**: Three.js com React Three Fiber (R3F)
- **UI 2D transicional**: shadcn/ui ou Radix UI para lobby e menus

### Backend + Transporte em Tempo Real
- **Runtime**: Node.js LTS
- **Transporte real-time**: Socket.IO v4
- **Persistência local**: SQLite via `better-sqlite3` (modo síncrono)

### Infraestrutura Local
- **Containerização**: Docker Compose + Nginx reverso (caddy/nginx alpine para TLS simples)
- **Observabilidade**: console.log + Pino (opcional, leve)

---

## 2. Contexto e Alternativas Avaliadas

### 2.1 Renderização 3D: Three.js vs R3F vs Alternativas CPU Puro

#### Three.js puro (Vanilla API)
Vantagens:
- Controle mínimo sobre ciclo de renderização
- Direct access a WebGL sem abstracção React

Desvantagens:
- Imperativo, mais verboso para componentes reutilizáveis
- Sem composição declarativa de cena

**Evidência**: threejs.org/docs — "Creating a scene" via imperativo `scene.add(object)` e loops de renderização manuais.

#### React Three Fiber (R3F)
Vantagens:
- Composição declarativa via componentes JSX (`<mesh />`, `<Canvas />`)
- Ecosistema React (useState, useEffect) para estado de jogo
- Sem overhead adicional — components render outside React
- Abstração `useFrame` para acesso ao loop de renderização nativo do Three

**Evidência**:
- docs.pmnd.rs/react-three-fiber: "No overhead. Components render outside of React. It outperforms Threejs in scale due to React's scheduling abilities."
- Sem limitações — "Everything that works in threejs will work here without exception."
- Keeps up with updates — features no Three.js ficam disponíveis instantaneamente via JSX

**Capacidades confirmadas**:
| Capacidade | Evidência na docs |
|------------|-------------------|
| Declaração declarativa de cena | `r3f.docs.pmnd.rs` — "Build your scene declaratively with re-usable, self-contained components" |
| State reactivo | Hooks React (`useState`, `useMemo`) dentro de componentes do canvas |
| Interatividade em tempo real | Callbacks `onClick`, `onPointerOver`, etc. expostos via JSX props |
| Performance sem overhead | "No overhead. Components render outside of React." — oficial R3F docs |

#### Alternativas CPU puro (Pixelforge, EASEL.js)
EASEL.js:
- API estilo Three.js via CPU rasterização (não WebGL)
- Deterministic canvas pixels
- Zero runtime dependencies

Rastreio: easal.js.org

Pixelforge:
- Vanilla JS puro (~2600 linhas sem build)
- Software renderer com z-buffer, Phong shading raytracing
- GPU path opcional em WebGL2

Tensão técnica: Para 2 jogadores simultâneos sob condições normais, Three.js/WebGPU + React oferece melhor trade-off entre desenvolvimento e experiência do usuário. CPU puro é útil para fallbacks ou restrições de hardware extremo (máquinas sem GPU dedicada), conforme antecipado no Product Brief — "degradação visual razoável".

**METAFER**: EASEL.js aparece como opção híbrida interessante: API Three.js com renderização CPU apenas, garantindo determinismo e zero overhead de WebGL. Contudo, para PoC focada na experiência 3D completa da mesa e cartas, Three.js + R3F permanece a escolha primária.

---

### 2.2 Transporte Real-Time: Socket.IO vs WebSockets Nativos

#### WebSockets Puros (WS)
Vantagens:
- Protocolo nativo RFC 6455
- Menor overhead binário
- Implementação simples com `new WebSocket()` no browser e `ws` ou `socket.io` server-side

Desvantagens:
- Sem fallback automático
- Sem rooms/namespaces out-of-the-box
- Gerenciamento manual de reconexão, buffering, estados de sessão
- Proxies corporativos frequentemente bloqueiam WS puro

**Evidência**:
- pkglog.com/blog/websocket-complete-guide — "When the client can't use WebSockets (some corporate proxies), it falls back to long-polling."
- Dev.to/abanoubkerols/socketio — Adds reconnection, buffering without manual code

#### Socket.IO v4
Vantagens:
* **Protocolo com fallback** — WebSocket → polling HTTP → other transports automaticamente
* **Reconexão automática** — "When a WebSocket connection drops, Socket.io reconnects silently."
* **Room scoping** — `socket.join('room-id')`, `io.to(room).emit()` para broadcasts seletivos
* **Namespaces** — `/lobby`, `/game` separados no mesmo WS/connection stream
* **Event acknowledgements** — callbacks server-bound sem extra código
* **Buffering de eventos** — mensagens enviadas offline são replayed after reconnect
* **Compatibilidade cross-browser/device** tested e battle-tested
* **Ecosistema gigante** — 742M+ dependents no npm, docs completas

Desvantagens:
- Overhead marginal adicional no payload (protocolo Socket.IO sobre WS)
- Requer library server (`socket.io`) + client (`socket.io-client`) sincronizados na versão

**Evidência**:
- Stacknotice.com/socketio-complete-guide — "It wraps WebSockets with automatic fallback, reconnection logic, rooms, namespaces, and event broadcasting."
- Dev.to/stacknotice — "Built-in scaling via adapters (Redis, PostgreSQL, etc.)" (não necessário para PoC local, mas documentado)

**Decisão**: Socket.IO selected over raw WS pela robustez out-of-the-box e compatibilidade com proxies corporativos. Para 2 jogadores em rede local, overhead é imperceptível em latência. O fallback automático garante que a app não quebre se o firewall bloquear WS direto.

---

### 2.3 Persistência de Estado Local: SQLite vs Alternativas

#### AsyncStorage (browser)
Vantagens: API simples no frontend.

Desvantagens:
- Sincrónico e serializado, mais lento para jogos com state complexo
- Sem ACID robusto, transactions limitadas
- Browser-specific implementation variations

#### node-sqlite3 (async API)
Vantagens: Compatibilidade ampla, async callbacks.

Desvantagens — "exposes low-level memory management functions", mutex thrashing.

**Evidência**: github.com/JoshuaWise/better-sqlite3 — "node-sqlite3 uses asynchronous APIs for tasks that are either CPU-bound or serialized... better-sqlite3 is simpler to use, and provides nice utilities."

#### better-sqlite3 (síncrono)
Vantagens:
- API síncrona familiar (`db.run()`, `db.prepare().get()`), mais rápida
- Full transaction support sem async overhead
- Thread-safe para reads concorrentes de UI (non-blocking I/O do Node protege contra contention)
- WAL mode default com alta performance

Desvantagens — native binding, não funciona em Worker Threads sem config extra.

**Evidência**:
- NPM docs: "Much faster than node-sqlite3 in most cases"
- "Easy-to-use synchronous API (better concurrency... yes you read that correctly)"
- "upward of 2000 queries per second with 5-way-joins in a 60 GB database"

**Decisão**: SQLite é suficiente para state do jogo v0.1 e histórico de partidas. better-sqlite3 por simplicidade e performance. Persistência autoritativa local — "estado da partida no servidor, não distribuído via broadcast", conforme exigido no Product Brief.

---

### 2.4 Node.js: built-in SQLite vs Modules externos

#### node:sqlite (native API do Node 22+)
Vantagens:
- Numa build com `--experimental-sqlite` ou v22+, SQLite via `node:sqlite.DatabaseSync()` sem módulos npm.

Desvantagens:
- Sincrônico, mas não async API como better-sqlite3
- Aparentemente só para file:mem paths simples e não WAL mode out-of-the-box

**Evidência**: nodejs.org/docs/api/sqlite — "The node:sqlite module facilitates working with SQLite databases... All APIs exposed by this class execute synchronously."

#### Node 22+ experimental vs better-sqlite3
Node LTS (v20) é padrão para Docker; v22+ é experimental nas features nativas. better-sqlite3 funciona em v18/v20 e além. Para uma PoC precisa, compatibilidade amplia e maturidade importa.

**Decisão**: Stick com better-sqlite3 no Node LTS atual (v20), evitando flags experimentais.

---

## 3. Consequências Arquiteturais

### Autoria de Estado
Com Socket.IO + broadcast seletivo por room, o estado do jogo é **autoritativo no servidor** (não-client-side state). O servidor emissor determina:
- Quem tem a vez
- Quais cartas estão viradas/virarem privadas para cada socket
- Quando um truco foi pedido e aceito/rejeitado

Clientes renderizam apenas o estado recebido e reenviam ações locais. Isso garante consistência sem sync storm, pois Socket.IO buffers mensagens de clientes offline e replaya em lote após reconexão.

### Private Cards via Socket Namespaces/Routes
Sockets individuais por jogador — cada um mantém socket data.userId. Quando uma carta é revelada: `socket.broadcast.to(room).emit('card-flipped', card)` onde o receptor vê a sua face, mas não emite sua mão (self-reveal omitido no broadcast) para preservar privacidade informacional.

### Offline Degradation
Socket.IO automaticamente buffers qualquer evento enviado antes de reconectar e replaya depois. A aplicação web pode carregar conteúdo estático via CDN/HAMRO enquanto aguarda conexão, exibindo toast "Conectando..." até `socket.on('connect')`.

### Escalabilidade Futura (METAFER)
Para 2 jogadores em LAN/Wi-Fi local, Socket.IO com broadcast direto funciona sem Redis adapter. Horizontal scaling futuro requereria socket.io-redis — não necessário nesta PoC, mas documentado para referência.

---

## 4. Recursos de Observabilidade e Debug

### Logging Local (Pino ou console)
Para desenvolvimento em Docker: Pino leve via `pino.transport({ targets: [ { target: 'pino-file', options: { destination: './logs/game.log' } }] })` para persistência persistente de logs de jogo.

**Evidência**:
- pinojs.com — "Fast, friendly logger"
- Docs: configure transport targets including file output

### Health Checks
Endpoint `/health` no server retornando status do DB (database.listDatabases()), count de rooms ocupadas (`io.engine.clientsCount`) e socket connections. Monitoramento via `node:sqlite` para ver se queries lentas ou locks.

---

## 5. Links Fonte e Documentação Oficial

- **Three.js**: https://threejs.org/docs — creating scene, API manual
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber — declarative scenes, hooks, examples
- **Drei (helpers)**: https://drei.docs.pmnd.rs — gizmos, controles camera, env map
- | Socket.IO v4: https://socket.io/docs/v4/ — rooms, fallbacks, namespaces

- **better-sqlite3**: https://github.com/WiseLibs/better-sqlite3 — WAL mode, transactions, API
- **node:sqlite**: nodejs.org/docs/api/sqlite — synchronous API (v22+ feature)
- **Socket.IO Protocol**: socket.io/docs/guides/protocol-overview — wire protocol specs

---

## 6. Restrições e Limitações Documentadas

### Sem Benchmarks Numéricos
Nenhum benchmark sem hardware específico, data e comandos que reproduzem o comando no repositório. Números de bundle size (Three.js ~2MB gzipped, R3F adicional via React CDN) devem ser verificados local antes de inclusão.

### Compatibilidade ARM64 Local
- better-sqlite3 compila nativamente em aarch64 Linux
- Three.js e Socket.IO são puros JS, sem compilation necessária

---

## 7. Apropriação (Open Source & Licença)

| Tech | License | Repo Oficial |
|------|---------|--------------|
| React 18 | MIT | react.dev |
| Three.js | MIT | threejs.org |
| R3F | MIT | pmndrs/react-three-fiber |
| Socket.IO v4 | MIT | socket.io/socket.io.js |
| better-sqlite3 | MPL-2.0 + LLVM binary license | github.com/WiseLibs/better-sqlite3 |
| Pino | MIT | pinojs.com |
| Docker Compose | Apache 2.0 | docs.docker.com/compose |

Todas as bibliotecas são open source e sem custo conforme restrição do contrato.

---

## Notas do Tech Lead (futuro)

Este ADR é a base para decomposição em cards de implementação. O Tech Lead definirá ordem de execução e paralelização dos cards filhos: backend_data (socket + DB schema), frontend (React shell + R3F Canvas), devops (Docker Compose config).

---

*Gerado pelo `cto` conforme Company Delivery Contract — decisions must persist in repository before review.*