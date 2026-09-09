# Especificação de Design — Trugo Online v0.1

Data: 2026-09-09
Versão do Card: `t_ac4a0712`
Branch: `feat/t_ac4a0712-design`

## 1. Visão geral da experiência visual

### 1.1 Transição 2D → 3D

- **Lobby**: Interface 2D limpa, flat design com tipografia sans-serif (Inter/System UI)
- **Ambiente de partida**: Ambiente 3D imersivo construído no Three.js
- **Trigger**: Segunda jogador conecta a sala → fade-out gradual (800ms) do lobby 2D + fade-in da mesa 3D com camera positioned overhand (45º de ângulo vertical, offset lateral esquerdo para o Jogador A)

### 1.2 Direção visual 3D

**Elementos da mesa:**
- Mesa retangular em perspetiva isométrica leve (azul feltro: RGB(50,80,60))
- Bordas com iluminação sutil de ambiente (ambiant light: RGB(40,45,40), intensity 0.3)
- Projeção das sombras suaves sob peças e jogadores

**Posicionamento dos jogadores:**
| Posição | Coordenadas Y relative (mesa=0) | Camera offset lateral | Camera pitch |
|---------|----------------------------------|----------------------|---------------|
| Jogador A | 0.6m | +2m (direita da mesa) | -8° (levemente acima) |
| Jogador B | -0.6m | -2m (esquerda da mesa) | +5° (subtílmente baixo) |

**Cartas:**
- Empilhadas em fante vertical com fanning sutil (2-3 graus entre cards)
- Animação de distribuição: slide-in com curva ease-out + rotação sobre a mesa
- Carta virada: flip 90º no eixo Y com easing quadratic (450ms)

**Brasos:**
- Renderizados como cilindros estilizados ao redor da mesa
- Cor: madeira clara (RGB(180,160,120)) com highlight sutil
- Animação de "jogando": slide linear lateral + easing-in back

**Mãos:**
- Face-up em 3D sobre a mesa (cards elevados 5mm acima da superfície para profundidade)
- Opacidade reduzida para cartas pertencentes ao jogador oponente (0.15, mantendo posição espacial)

## 2. Fluxos e Estados UI/UX

### 2.1 Estados de carregamento

| Estado | Gatilho | Duração máxima | Artefato esperado |
|--------|---------|----------------|-------------------|
| `LOADING_SPLASH` | App mount + WebSockets init | 3s | Spinner centralizado no logo |
| `CONNECTING_TO_LOBBY` | WebSocket handshake pending | 10s | Overlay "Conectando..." com indicador de pulse |
| `LOADING_3D_WORLD` | Game start → WebGL context ready | 8s | Fade-out lobby, spinner transparente sobre mesa em setup |

**Fallback:** Se >10s no lobby ou >15s carregando mundo 3D, mostrar `ERROR_CONNECTION_TIMEOUT`.

### 2.2 Estado de erro

| Código | Causa | Mensagem sugerida para usuário |
|--------|------|--------------------------------|
| `ERROR_SOCKET_FAIL` | Websocket falha (porta fechada, CORS) | "Não pôde conectar ao servidor local. Verifique sua conexão e reinicie." |
| `ERROR_ROOM_FULL` | >2 jogadores na sala | "Esta partida já está com ocupação máxima. Tente criar um novo jogo ou aguarde alguém sair." |
| `ERROR_GAME_ALREADY_STARTED` | Tentativa de join pós-game start | "Esta partida já começou. Entre no link do Jogador 2 diretamente." |
| `ERROR_OFFLINE` | navigator.onLine = false (detectado periodicamente) | "Sua conexão caiu. Recarregue para se reconectar ao servidor local." |

**Design padrão:** Modal centralizado, backdrop blur suave, ícone de alerta simples. Não bloqueia a saída do modal com botão; usuário pode fechar em erros não críticos.

### 2.3 Estado da sala cheia (room full)

**Comportamento UI:**
- Badges no cabeçalho: "● 0/2 jogadores" durante `ROOM_EMPTY` → "● 1/2 aguardando..."
- Ao lotar (segundo jogador), o lobby desaparece e a mesa aparece.
- Mensagem de confirmacao: "Quem está entrando agora é o Jogador A. Quem for o segundo começará a partida imediatamente."

**Feedback temporal:** Timer de countdown reverso quando o jogo inicia (ex: 30s antes de start → badge muda para "Começando em 30s...")

### 2.4 Estado offline

- Polling cada 5s em background: `navigator.onLine`
- Se falso: overlay semi-transparente escurecido sobre todos os elementos da UI 3D
- Badge persistente: "[Conexão instável]" no canto superior
- Ao reconectar: auto-retry com socket e animação de reintegração à mesa (cards "voltam" para estado face-down)

### 2.5 Estado de espera (waiting room / matchmaking)

Para futuras iterações (v0.2+), mas documentado por antecipação:
- Lobby de espera compartilhado visualmente com o lobby atual (2D durante espera)
- Badge indicador: "Jogador encontrado! Entrando em breve..."

## 3. Responsividade e degradação 3D

### 3.1 Breakpoints principais

| Largura | Comportamento sugerido |
|---------|------------------------|
| < 600px (mobile landscape) | Layout 3D ajusta camera, reduz sombras dinâmicas para manter 30-60fps |
| 600–900px (tablets) | Full fidelity com todos efeitos habilitados se GPU suportada |
| > 1024px (desktop) | Fidelity máxima, iluminação global, sombreamento suave habilitados |

### 3.2 Degradação inteligente para GPUs integradas ou sem dedicação

- Nível de anisotropy: força a 8x se ext/OpenGL > 1024, senão off
- Shadows: desligam-se quando frame_rate < 25fps por mais de 3s (fallback a luz difusa)
- Bloom/ambient occlusion: desativado na detecção de GPU integrada (via WebGLRenderer.capabilities)
- Textures: mipmaps reduzidos se memória > 90%, manter apenas nível base

### 3.3 Fallback para Web Workers limitados (single-threaded context)

- Renderização em main thread só se necessary, fallback a draw calls simples sem geometria excessiva
- Partículas simplificadas a <5 instâncias se memória pressuposta

## 4. Acessibilidade (WCAG 2.1 AA mínimo)

### 4.1 Contraste

- UI 2D do lobby: foreground sobre fundos claros > 4.5:1, fundos escuros > 7:1
- Texto de UI na mesa 3D (turno, placar): cores com opacidade fixa no plano Z=10, independente da mesa (fundo azulado) e cartas (fundo RGB(240,220,200))
- Mensagens críticas (você tem TRUCO!): borda amarela vibrante (#FFD700) com contraste 8:1 sobre verde feltro

### 4.2 Navegação via teclado e leitores de tela

- No lobby 2D: todos botões/links focáveis, tabindex adequado
- Na mesa 3D: elementos UI (UI overlays para turno, placar) mantidos como HTML acessível (ARIA labels explicando "placar 1x vs 2x", "sua vez de jogar cartas")
- Leitor de tela anuncia mudança de mensagem crítica no lobby

### 4.3 Redução de movimento paraMotion sensitivity setting

- Não usar auto-rotating ou parallax excessivo
- Transições de UI limitadas a 500ms
- Opção "Modo calmo" desabilita animações de cartas, focando no status da jogada (para usuários com vestibule)

## 5. Critérios verificáveis de验收

| Critério | Como verificar localmente |
|----------|--------------------------|
| Carregamento e lobby funcionando | Verifique se splash dura <2s e aparece logo na abertura do navegador |
| Conexão WebSocket estável | Use `ws://localhost:3001` (URL da homologação) e aguarde resposta de handshake em ~50ms |
| Transição 2D→3D suave | Abra com tab A criando sala, depois abrir tab B para join; observe fade-in de mesa sem flicker |
| Sala cheia feedback correto | Abra 3 tabs na mesma sala — terceiro deve ver mensagem de erro `ERROR_ROOM_FULL` |
| Erro e timeout visíveis | Simule perda de conexão (desligue Wi-Fi depois de conectar); verifique reconnected animation ao voltar online |
| Responsividade em diferentes larguras | Redimensione janela e observe ajuste de camera e fallback suave de sombras/bloom |
| Contraste em UI sobre fundo 3D | Use ferramenta de contraste da ferramenta para verificar UI sobre mesa e cartas com leitura clara >4.5:1 |
| Navegação teclado funciona no lobby | Tab através dos botões; Enter ativa ações; Escape fecha modais |
| Animações suavizadas | Abra DevTools Performance tab e verifique se frame drops < 3 durante animações de carta/braco |

## 6. Artefatos derivados (versão futura)

- Wireframes de cada tela em Figma, exportados como URLs para review
- Assets 3D modelados no Blender antes do import em glTF para Three.js
- Mockup HTML autocontido (`docs/design/drafts/lobby-mockup-v0.1.html`) apenas como rascunho inicial, não substitui especificação acima

## 7. Notas de implementação para developers

- Use `src/ui/loading-state.ts` para todos componentes de loading/erro com shared types
- Use `src/constants/flow-transitions.ts` para timings e easing curves
- UI 3D: use `OverlayPlane` do Three.js para manter HTML sobre geometria (evite ler texturas diretamente de mesh via Raycaster)
- WebSockets falham ao reconectar? Implementei `auto-reconnect-backoff` com expoente 1.5, max interval 30s, min 2s

## 8. Histórico de decisões de design (TBD)

Acompanhamento de mudanças entre v0.1 e futuras iterações:
- Qual easing usar para transição lobby → mesa (curva escolhida: Cubic-bezier(0.3,0.1,0.1,1))
- Decisão de não permitir drag-and-drop na mesa 3D (apenas UI clicável) para manter performance e clareza

---

**Criado por:** `designer`
**Para revisão por:** `@pm_ux_researcher_bot`
**Comunidade:** GitHub PR contra `release/v0.1` com base em `feat/t_ac4a0712-design`
