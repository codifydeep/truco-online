# Design Spec — Truco Online v0.1

**Versão:** 0.1 (R2 corrigido)
**Autor:** designer
**Data:** 2026-09-09
**Base Git:** `truco-online/t_245c3ab9-design-v0.1-r2-corrigir-fluxos-e-privaci`

Esta especificação documenta todos os estados da aplicação, transições automáticas e critérios visuais/interativos para homologação v0.1.

---

## Stack (conforme ADR 0001)

- Frontend Web: React + R3F (React Three Fiber) + Socket.IO v4
- Transporte: WebSocket em tempo real (server-side transport, não implementado nesta spec)
- Banco: better-sqlite3 WAL
- Acessibilidade: contraste WCAG AA, reduced-motion-aware, teclado funcional
- Viewport: responsivo mobile-first

---

## Estados obrigatórios

### 1. Vazio — Página inicial / first visit

**Quando:** Primeira visita, sem salas ativas ou partida em andamento.
**Objetivo:** Apresentar CTA único ("Criar Sala") + opções de login/Guest.

**Elementos UI:**
- Hero: título "Truco Online" (H1)
- Botão principal (action): `Criar Sala` (accessible, aria-key="create-room", foco via tabindex=0)
- Links secundários: Sair, Termos
- Footer: versão e créditos

**Comportamentos:**
- Nenhum countdown ou temporizador visível.
- Reduced-motion: esconder animações de entrada.
- Teclado: Tab para navegar direto ao botão CTA.
- Contraste: texto em escala 4.5:1 mínimo; botões com hover state distinto.

---

### 2. Carregando — Booting / loading assets

**Quando:** App está carregando módulos, 3D engine ou fallback (ex: WebGL não suportado).
**Objetivo:** Feedback visual sem interromper fluxo automático.

**Elementos UI:**
- Overlay full-screen com spinner minimalista ou mensagem "Carregando..."
- Opção de pular após N segundos (opcional, apenas para UX)

**Transição:**
- Após carregamento concluído: overlay desaparece → entra estado Sala em espera.
- Erro ao carregar assets: fallback para estado Erro com botão `Tentar Novamente`.

---

### 3. Erro — Connection failed / error state

**Quando:** Falha de conexão WebSocket, erro HTTP ou status inválido do servidor.

**Elementos UI:**
- Icone de aviso (ex: ícone de erro vermelho) + mensagem explícita: "Conexão não pôde ser estabelecida."
- Botão `Reconectar` que tenta reabrir conexão
- Mensagem opcional com sugestões (ex: verifique sua conexão).

**Transições:**
- Após reconexão bem-sucedida → volta ao estado anterior (Vazio/Sala em espera).
- Se falha persistir por Xs, mostra mensagem alternativa e botão de suporte.

---

### 4. Sala em espera — Waiting solo

**Quando:** Apenas um jogador entrou na sala.

**Objetivo:** Mostrar que está aguardando o segundo jogador para iniciar partida.

**Elementos UI:**
- Lista da sala (nome, ID do host)
- Indicador de status: `Aguardando 1 jogador...`
- Timer opcional de espera? → **NÃO**. Sem countdown.

**Transição automática:**
- Ao entrar o segundo jogador:
  - Interface muda de 2D lobby → transição para 3D ambiente da mesa.
  - As cartas privadas (hand) são reveladas automaticamente sem interação do usuário extra.
  - Partida inicia sem botão "Começar" ou interação adicional.

---

### 5. Sala cheia — Party ready / live game

**Quando:** Dois jogadores estão presentes e conectados.

**Objetivo:** Renderizar a partida 3D com cartas privadas, mesa virtual, indicadores de turno.

**Elementos UI (3D):**
- Mesa tridimensional com cartas renderizadas por R3F.
- Cartas do oponente: **MAIS PRIVADAS**. Nunca mostram opacidade parcial ou qualquer indicador que "vaze" valores. São Renderizado como silhueta ou verso padrão, nunca revelando conteúdo.
- Indicador de turno ativo (ex: círculo ao redor da mão ativa)
- Botões de ação (chamar/truque/aceitar) apenas para jogador atuante.

**Transições:**
- Ao receber mensagem do peer sobre oponente entrando → trigger automático para swap 2D→3D.
- Ao finalizar partida e recomeçar nova ronda: mesma transição se houver novo peer.

---

### 6. Sala cheia / partida em andamento — live game state

**Quando:** Partida ativa com jogada em progresso.

**Elementos UI (continuação do estado anterior):**
- Cartas privadas mantidas com privacidade absoluta (sem opacidade)
- Feedback de jogada: animação de carta jogada + atualização da mesa
- Botões desativados para jogador não atuante

**Comportamentos:**
- Eventos de socket disparados por cada ação
- Animações reduzidas se user prefer reduced-motion no sistema

---

### 7. Reconexão — Reconnection attempt

**Quando:** Dispositivo foi desconectado (ex: rede instável) e tenta reconectar.

**Elementos UI:**
- Overlay "Reconectando..." com status de progresso
- Se reconexão falha após X tentativas → redireciona para estado Erro com botão `Sair` ou `Criar Nova Sala`.

---

## Critérios visuais e acessibilidade

### Contraste / legibilidade

- Texto mínimo: escala 4.5:1 em relação ao fundo
- Botões: hover state com cor distinta e foco via teclado visível
- Erro/sucesso: codificação de cores consistente (vermelho para erro, verde para sucesso)

### Reduced motion / preferreduced-motion

- Se detected `prefers-reduced-motion: reduce`:
  - Remove animações de transição entre estados (ex: fade, slides)
  - Mantém feedback visual mínimo (ex: piscar rápido para indicar erro)

### Vista e viewport responsivo

- Mobile: adaptar altura da mesa + tamanhos de cartas para telas pequenas
- Touch targets ≥48px em mobile
- Orientação landscape no 3D sempre que possível; fallback vertical no portrait

### Teclado / foco

- Todos os botões navegáveis via Tab
- Focus ring visível (>2px) com cor de alto contraste
- Ordem lógica: CTA principal → lista de sala → feedback → ações da partida

---

## Transições automáticas (sem interação manual extra)

| Estado anterior | Evento trigger                               | Estado resultante            |
|-----------------|---------------------------------------------|------------------------------|
| Vazio           | clique em "Criar Sala"                      | Carregando                   |
| Carregando      | assets carregados                           | Sala em espera               |
| Sala em espera  | segundo jogador entra (socket event)        | Sala cheia / partida 3D     |
| Erro            | clique em "Reconectar" com sucesso          | Estado anterior              |
| Partida 3D      | peer desconecta → sala cheia vira 2D?       | Sala em espera ou erro       |

---

## Privacidade absoluta de mãos (cartas do oponente)

**Regra inquebrável:** nunca revelamos cartas do oponente através de opacidade, hover, animação ou indicador visual. As cartas do peer são:
- Renderidas como verso padrão (back face material)
- Nunca mudam de cor, opacidade ou textura durante a partida
- Qualquer técnica de "peek" é considerado bug de UX e deve ser corrigido

---

## Próximos passos para designer

1. Gerar wireframes rápidos (Figma/Pixate) dos estados acima
2. Implementar artefatos 2D com Framer Motion/React para transição
3. Preparar assets 3D (mesa, cartas, deck base Copag) conforme ADR
4. Validar critério de acessibilidade na build final

---

**Arquivos anexos (gerar durante desenvolvimento):**

- `/docs/design/v0.1/protocolo-privacidade.md` — explicação técnica da não-opacidade
- `/docs/design/v0.1/checklist-states.md` — checklist QA dos estados listados
- `/public/prototype/sala-em-espera.html` (opcional) — demo HTML das regras

---

*Esta especificação é documento vivo: atualizar com cada novo estado detectado em produção.*
