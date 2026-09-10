# ADR 0001 — Stack Web, 3D e Transporte em Tempo Real v0.1

| Aspecto             | Decisão                          | Justificativa                                                                 | Fontes Oficiais                                                                                |
|---------------------|----------------------------------|-------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| **Frontend Web**    | React 18 + @react-three/fiber   | Composição, scheduling do React para renderização demandada                  | https://r3f.docs.pmnd.rs                                                                      |
| **Engine 3D**       | three.js                        | Renderizado WebGL/WebGPU padrão, compatibilidade universal                   | https://threejs.org                                                                           |
| **UI/HUD**          | DOM HTML + Canvas2D             | Elementos CSS/DOM sobre canvas para estatísticas, lobby                      | https://threejs.org/docs/pages/CSS2DRenderer.html                                              |
| **Transporte RT**   | Socket.IO (v4)                  | WebSockets primário + fallback automático, auto-recovery                    | https://socket.io/docs/v4                                                                      |
| **Persistência**    | SQLite via better-sqlite3       | API síncrona, operações em microssegundos para single-writer                 | https://mako.ai/guides/sqlite/connect-from-node                                                |
| **Controle Câmera** | three.js Camera + OrbitControls | Evitar @react-three/drei CameraControls por problema de performance em ARM64  | https://discourse.threejs.org/t/performance-issues-with-r3f-drei-cameracontrols-on-low-end-devices/74776 |
| **Lobby/UI inicial**| DOM React (2D)                  | Lobby antes do jogo começa, ambiente 3D apenas no início da partida          | Requirement Brief                                                                             |

## 1. Frontend Web e Renderização 3D

### Alternativas avaliadas

#### a) React Three Fiber (R3F) + three.js
- Vantagem: Composição declarativa React, components reutilizáveis, scheduling de renderização demandada
- Desvantagem: Learning curve para React se não utilizado anteriormente
|- Evidência: Scheduling de renderização demandada, consumo CPU/GPU reduzido

#### b) Vue + Vite3D / ou WebGL puro sem framework
|- Vantagem: Bundle potencial menor com apenas WebGL
|- Desvantagem: Sem estrutura de composições, state management manual, menos exemplos e comunidade
|- Veredito: Não recomendado pela falta de ecosistema e suporte a componentes complexos como UI sobreposto 3D

#### c) Unity ou Unreal via WebBuildPipeline (WBP)
|- Vantagem: Ferramentas profissionais, assets prontos
|- Desvantagem: BUILD META tamanho de imagem ≥10MB, dependências nativas requerem ambientes específicos
|- Veredito: Fora do escopo por tamanho e requisitos de ambiente

### Decisão
**R3F + three.js** selecionado pelo:
- Scheduling demandado (performance em ARM64)
- UI híbrida DOM+Canvas pronta via CSS2DRenderer/CanvasTexture
- Ecossistema ativo com componentes ThreeAddons/Drei prontos para uso
- Compatibilidade total com React 18

### Performance budget (ARM64 local)
META: Rasterização em até 60 FPS na GPU integrada ARM64 (validar via Chrome DevTools no hardware específico)
META: Fallback para dispositivos sem aceleração de hardware (ESTIMATIVA: degradado visual com 15-20 FPS, medir localmente)
- Validação: Medir com `canvas.getContext('webgl')` e perfurar via Chrome DevTools Performance Tab

## 2. Render Modes para Three.js / R3F

### Alternativas de render mode no Canvas

| Mode      | Descrição                                                                                             | Uso na PoC                                      |
|-----------|-------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| always    | Renderiza em cada frame (60 Hz)                                                                       | Modo padrão, compatibilidade máxima              |
| never     | Renderiza apenas quando o estado muda                                                                  | Não usado - perde sincronização                  |
| demand    | Controlado manualmente via invalidate() ou React state updates                                       | Selecionado para controle de consumo CPU/GPU     |

#### Decisão: usar frameloop="demand" onde necessário, renderização demandada via React state e invalidate
```jsx
<Canvas frameloop="demand" camera={{ position: [0, 0, 10] }}>
  {/* Render apenas quando o React state ou invalidate() forem chamados */}
  <OrbitControls />
  ...
</Canvas>
```

#### Razão:
- Reduz consumo energético em ARM64 (Apple Silicon)
- Sincroniza animações sem jumps visíveis usando invalidate() prévio
- Mitiga lag em dispositivos de baixa performance

Referências:
- https://r3f.docs.pmnd.rs/advanced/scaling-performance
- https://r3f.docs.pmnd.rs/advanced/pitfalls

## 3. Servidor Autoritativo e Transporte Real-Time

### Alternativas avaliadas

#### a) Socket.IO (v4) vs Raw WebSockets via ws/libws
- Socket.IO Vantagens:
  - Handshake HTTP + upgrade para WebSocket automático
  - Fallback: long-polling, Server-Sent Events para navegadores antigos/proxies estranhos
  - Auto-reconnect com backoff exponencial
  - Multiplexação: múltiplos sockets em uma única conexão
  - Binary support (ArrayBuffer, Blob) - essencial para coordenadas e sprites
- Raw WebSocket Desvantagens:
  - Sem fallback automático, quebra em proxies mal configurados
- Veredito: Socket.IO selecionado por robustez de rede.

#### b) MQTT vs STOMP sobre WebSocket
- Vantagem: Tópicos para namespaces (salas de jogo), QoS
- Desvantagem: Payloads maiores, menos familiaridade, overhead protocolário
- Veredito: Socket.IO namespace/rooms são suficientes para PoC

#### c) SignalR / Firebase Realtime Database / Supabase Realtime
- Vantagem: Cloud-hosted ou serverless
- Desvantagem: Dependência externa de cloud, custos com egresso/billing surpresa, latência adicional
- Veredito: Fora do escopo - PoC local exigindo open-source sem custo

### Decisão
**Socket.IO (v4)** selecionado por:
- WebSockets primário com fallback automático
- Auto-reconnection out-of-the-box
- Multiplexação em uma única conexão
- Multiplexação de eventos para lobby e partidas via namespaces
- Binary support para sincronizar estados de mesa/cartas/posições

### Contratos da API (draft)
```typescript
interface GameState {
  turn: number;
  trumpSuit: string | null;
  trumps: Record<string, number>;
  playerHands: Record<string, Card[]>; // PRIVATE - não expor ao oponente
  lastAction: Action | null;
}

type Action =
  | { type: 'call', value: number, suit?: string }
  | { type: 'trick', cards: Card[] }
  | { type: 'revoke', playerId: string, cardIndex: number }
  | { type: 'pass' }
  | { type: 'endTurn' };

interface EventPayload {
  gameId: string;
  event: string;
  payload?: GameState | Action;
}
```

## 4. Persistência de Dados e Estado

### Alternativas avaliadas

#### a) Node.js native node:sqlite (v22.5+)
- Vantagem: Zero-dependência nativa
- Desvantagem: API nova, menos documentação em relação ao terceiro party
- Nota: Melhor opção apenas para Node 22.5+ sem add-deps

#### b) sql.js (SQLite no WebAssembly)
|- Vantagem: Executa no cliente, zero-nativo
|- Desvantagem: META ~10x mais lento que native, não para servidor
|- Veredito: Não usado - o estado da partida vive no servidor; apenas stats/analytics poderiam ser client-side

#### Decisão
**better-sqlite3** selecionado por:
||- API síncrona que é ideal para SQLite (single-writer)
||- Operação síncrona evita async boundary do event loop Node.js
||- WAL mode nativo, transações de nível 1
||- Ecosystem maduro - default driver suportado por Drizzle ORM, Kysely, Prisma

#### Configuração obrigatória:
```typescript
const db = new Database('./data.db');

// Pragma recomendado para PoC local:
db.pragma('journal_mode = WAL');           // Concorrente leitura + escrita
db.pragma('foreign_keys = ON');            // Integridade referencial
db.pragma('busy_timeout = 5000');          // Evitar SQLITE_BUSY
db.pragma('cache_size = -64000');          // ~64MB page cache
db.pragma('synchronous = NORMAL');          // Trade-off seg + perf
db.pragma('temp_store = MEMORY');           // Evita I/O para temp tables

// Schema de partida:
create table games (
  id text primary key,        // UUID v4 ou slug como "game-2026-09-08-abcd"
  createdAt integer not null,
  gameState jsonb             // Estado snapshot - versionado via migrations
);

create table players (
  gameId text not null references games(id),
  name text not null unique,
  hand jsonb                  // Cartas privadas - não-exponível
);

// Transactions:
db.transaction((players) => {
  players.forEach(hand => db.prepare('INSERT INTO players...').run(hand));
});
```

## 5. Contratos e Reconexão

### Eventos da API (client-side only, server mantém authority)

| Direção     | Evento            | Payload                              |
|-------------|-------------------|--------------------------------------|
| Server→All  | game-state       | Estado completo sincronizado         |
| Client→All  | player-action    | Ações do jogador atual (cards, call, pass) |
| All→Client  | trick-resolved   | Cartas reveladas deste turno         |

### Reconexão e Consistência

- Server: Persiste estado em SQLite; ao reconectar envia último snapshot via game-state
- Client: Rejoga eventos acumulados (buffer) contra o último estado do servidor
- Reconciliación: Se divergente, server é authority - client aplica diff local

## 6. Segurança Básica

### OWASP Top 10 - Controles de higiene planejados para PoC:

| Ameaça               | Mitigação                                                      |
|----------------------|-----------------------------------------------------------------|
| Injection            | Prepared statements (better-sqlite3)                            |
| XSS                  | Sanitar inputs React; eslint-plugin-react-helmet                |
| CSRF                  | SameSite=Strict no cookie + token em headers HTTP                |
| Session Hijacking    | Conexões criptografadas (auto TLS via Self-signed ou cloud CA); Socket.IO com handshake seguro |

### HTTPS Local
Para homologação local, usar:
```bash
openssl req -x509 -newkey rsa:4096 -nodes -sha256 \
  -keyout key.pem -out cert.pem -days 365 \
  -subj "/CN=localhost"
```

Incorporar em Docker Compose como volume.

## 7. Observabilidade e Logs

- console.{info,warn,error} para debugging local
- Structured logging: JSON.stringify + transport via WebSocket a file://logger (opcional)
- Telemetria simples: counters de events emitidos

### Stack recomendado para logs avançados
- Winston + DailyRotateFile - /logs/app.log
- Pino para performance
- Grafana/Prometheus local (meta-futura)

## 8. Docker e Arm64 Local

### Imagens oficiais recomendadas por tamanho e layer caching

| Servico               | Imagem                    | Tamanho (META) | Uso                                              |
|-----------------------|---------------------------|----------------|--------------------------------------------------|
| Node.js backend       | node:20-alpine            | ~150MB         | Servidor + Socket.IO                              |
| SQLite data           | Alpine Linux base         | ~3MB           | Montado como volume para persistência             |

### Dockerfile minimalista (exemplo backend)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Multi-stage: runtime
FROM node:20-alpine
WORKDIR app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data.db ./data.db
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### docker-compose.yaml local (exemplo)
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports: ['3000:3000']
    volumes:
      - sqlite-data:/app/data
    environment:
      PORT: 3000
volumes:
  sqlite-data:
```

## 9. Roadmap e Metricas Futuras (META e ESTIMATIVA)

- META v1: Medir tempo de build <2min via pnpm com lockfile (cache pnpm cache)
- ESTIMATIVA v3: Reduzir tamanho do bundle principal (<500KB gzip) por tree-shaking R3F (medir via webpack-bundle-analyzer)

Medindo apenas com:
```bash
# Bundle analysis (por exemplo, com webpack-bundle-analyzer):
pnpm run build && npx webpack-bundle-analyzer -p dist/stats.json

# Runtime FPS: medir via Chrome DevTools Performance — abrir Recording e analisar o tree no "Rendering" tab. Capturar imagens em performance.now() apenas com timestamp e versionagem registrados.

# SQLite query latency: db.prepare('SELECT rowid FROM games...').time() em us
```

## 10. Riscos e Limitações Documentadas

| Risco                    | Mitigação                                                      |
|--------------------------|-----------------------------------------------------------------|
| ARM64 GPU limitada       | Render mode demand + invalidate(); fallback para 2D DOM        |
| Disconexão de rede       | Socket.IO auto-reconnect + buffer no client                     |
| Dados não persistidos    | Volume mounted SQLite em container                               |
| Cheating                 | State server-authoritative; validacao client-side apenas UI     |

---

## References (links diretos oficiais)

- https://www.threejs.org                                 # Three.js home
- https://threejs.org/docs/#examples                       # API reference
- https://r3f.docs.pmnd.rs                                 # React Three Fiber
- https://socket.io/docs/v4/                               # Socket.IO v4 docs
- https://better-sqlite3.github.io/better-sqlite3/    # better-sqlite3 docs
- https://sqlite.org/docs.html                            # SQLite docs geral
- https://owasp.org/www-project-top-ten/                 # OWASP Top 10
