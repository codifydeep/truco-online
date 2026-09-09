# Product Backlog — Truco Online v0.1

Este backlog descreve histórias de produto ordenadas por valor de negócio e dependências técnicas mínimas.
Cada item é formulado como um critério funcional que o Tech Lead deve decompor em tasks de implementação específicas para os perfis `backend_data`, `frontend` e `designer`.

**Status**: Aprovado pelo CEO em 8/09/2026 — lista estável até nova release.
**Responsável**: @produto (criador do backlog).
**Coordenação técnica**: @techlead_truco_poc_bot.

---

## 🧱 EPIC 1 — Lobby e criação de sala (pré-partida)

### H-0101 — Criar sala única com dois jogadores
Como: primeiro jogador que abre a URL,
Quero poder criar uma nova sala de jogo com um apelido (ex: via `?alias=alice`),
Para que o segundo jogador possa entrar na mesma sala e ver os detalhes do lobby.

**Critérios de aceite observáveis**:

1. Ao acessar `https://localhost:8080?alias=Alice`, a UI cria uma nova sala no state backend, se não existir uma em aberto na lista ativa.
2. A página exibe uma mensagem de "Aguardando jogador 2..." junto ao apelido do jogador criador.
3. Uma nova sessão com `?alias=Bob` vê a mesma sala aberta e permite entrar nela (sem pedir nome novo).
4. Ao atingir o segundo jogador, a transição para ambiente 3D é acionada automaticamente após ~3s de silêncio ou clique explícito no botão "Entrar na mesa".

**Decisões técnicas pendentes**:

- Endpoint WebSocket `/ws/create-room` aceita `alias` e devolve `room_id`, `my_seat_index`.
- Socket.io: manter lista global em `rooms` no server local. A chave de sala é o hash do apelido (ou UUID curto).

---

### H-0102 — Entrar em sala existente sem recriação acidental
Como: segundo jogador que abre a URL,
Quero entrar numa sala já criada pelo primeiro jogador,
Para que não haja duplicação de ambientes.

**Critérios de aceite observáveis**:

1. Se a URL aponta para uma sala ativa (hash do apelido existente), a UI lê o estado e insere o usuário como `player2`.
2. Se a sala tiver apenas um jogador (`player1` + `null`), entra automaticamente sem pedir nova criação.
3. Se uma terceira sessão tentar entrar em `?alias=Charlie`, recebe aviso de "Sala cheia" e oferece botão "Criar outra sala".

---

### H-0103 — Sair da sala antes do início da partida
Como: jogador que não quer mais jogar,
Quero deixar a sala para aguardar um novo entrante (se ainda houver tempo).

**Critérios de aceite observáveis**:

1. Ao fechar o navegador ou clicar em "Sair", a sala é limpa e reaberta após 30 segundos sem conexões ativas (timeout suave).
2. O outro jogador vê mensagem "Jogador saiu: Aguardando nova partida..." na lista de salas.

---

## 🎮 EPIC 2 — Ambiente 2D do lobby e transição para 3D

### H-0201 — Lobby 2D com lista de salas disponíveis
Como: usuário que chega pela primeira vez,
Quero ver todas as salas em aberto (ou seja, criadas mas sem partida iniciada),
Para escolher uma existente ou criar a minha própria.

**Critérios de aceite observáveis**:

- UI exibe lista de `room_id` com status "Aguardando jogador 2".
- Ao clicar em "Entrar no lobby da sala X", a UI carrega o estado da sala e permite criar uma partida nova imediatamente (se a sala ainda não tem partida iniciada).

---

### H-0202 — Transição do lobby 2D para mesa 3D ao iniciar
Como: jogador que confirma a partida,
Quero mudar o ambiente visual de 2D para 3D da mesa virtual,
Para imergir na experiência de jogo em Three.js.

**Critérios de aceite observáveis**:

1. Botão "Iniciar partida" aciona troca da cena WebGL (via Three.js) e carrega assets de mesa, jogadores e cartas.
2. A cena 3D começa com ambas as mãos vazias antes que o dealer distribua as cartas.
3. Após ~5s ou após receber o signal do server, a distribuição começa automaticamente: Player → Player → Dealer.

---

## 🃏 EPIC 3 — Distribuição de cartas e virada da mesa (turno do "dealer")

### H-0301 — Distribuir três cartas para cada jogador aleatoriamente
Como: dealer que inicia a mão,
Quero distribuir exatamente 3 cartas para cada jogador na ordem correta,
Para seguir o fluxo oficial Truco Paulista.

**Critérios de aceite observáveis**:

1. O servidor embaralha localmente e envia as 3 cartas para cada player via mensagem discreta ("recebeu carta: [naipe+valor]").
2. O cliente atualiza seu estado interno sem exibir a carta ainda (carta secreta).
3. Ao fim da distribuição, o estado `hasDealer = false` sinaliza que virar deve ser acionado.

---

### H-0302 — Vira e publicar as manilhas públicas na mesa 3D
Como: sistema ao final da distribuição,
Quero virar uma carta (a vira) e mostrar as quatro cartas de manilha ativas em destaque na mesa
Para que todos saibam qual naipe é "Zap" desta rodada.

**Critérios de aceite observáveis**:

1. O servidor anuncia `"vira=5_of_spades"` + lista das 4 manilhas atuais.
2. A UI 3D renderiza as manilhas como pequenas cartas viradas na mesa (ex: ícone de "Zap" destacado com cor vermelha).
3. As 3 cartas secretas dos jogadores permanecem ocultas visualmente na mão deles.

---

## 🎲 EPIC 4 — Jogo das rodadas (trick-by-trick) e hierarquia de cartas

### H-0401 — Jogar carta da mão secreta em tempo real
Como: jogador na sua vez,
Quero selecionar uma das três cartas secretas na interface (dropdown/menu),
Para jogar a carta escolhida e revelar na mesa ao adversário.

**Critérios de aceite observáveis**:

1. Menu UI exibe as 3 cartas que o jogador recebeu (carta secreta) antes de jogar cada rodada.
2. Ao clicar em "Jogar [Carta]", o servidor atualiza `player.cards_in_play = [selected_card_id]`.
3. A UI 3D anima a carta saindo da mão virtual do jogador e aparecendo na mesa.

---

### H-0402 — Comparar cartas publicamente após cada jogada (truco paulista)
Como: sistema ao fim de cada rodada,
Quero determinar quem venceu a rodada com base na hierarquia definida no truco-paulista-rules-v0.1.md,
Para exibir o resultado da rodada e somar pontos.

**Critérios de aceite observáveis**:

1. Backend recebe `playerA_played: "7_of_clubs"`, `playerB_played: "4_of_diamonds"`.
2. O backend verifica a hierarquia (manilhas > cartas comuns; naipe irrelevante para comuns).
3. Se A vence: anuncia `"rodada_ganhou: teamA"` e anima carta de B sendo coberta pela carta de A.
4. Pontuação atual `teamA_points` e `teamB_points` são atualizadas: +1 para quem ganhou a rodada (ou mais se for truco aceito).

---

### H-0403 — Pedir Truco / Vale 6 / Vale 9 / Vale 12 conforme regras do turno
Como: jogador na sua vez, com direito de pedir truco,
Quero exibir os 4 botões de aumento (Truco, Vale 6, Vale 9, Vale 12),
Para pressionar adversário ou defender minha mão com mais pontos em jogo.

**Critérios de aceite observáveis**:

1. Na UI do jogador sobe um modal/suplemento "Pedir Truco".
2. Botões aparecem se o turno dele e não estiverem negados (verificar no 5.6).
3. Ao aceitar: servidor atualiza `hand_value = 3, 6, 9, 12` conforme aumentado.
4. Ao negar: server envia `"rodada_negou_turbo"` + soma pontos para o desafiador conforme regras (ver EPIC 5).

---

## 🧮 EPIC 5 — Soma de rodadas e fim da partida ao atingir 12 pontos

### H-0501 — Atualizar placar após todas as rodadas da mão
Como: sistema após três rodadas,
Quero somar os pontos acumulados em cada jogo (truco / mano simples) no placar global,
Para mostrar quem está ganhando e se o jogo acabou.

**Critérios de aceite observáveis**:

1. Cada rodada ganha: `teamA_points += 1` ou `teamB_points += 1`.
2. Se for truco aceito: soma +3 pontos para o time que ganhe todas as rodadas da mão.
3. UI renderiza placar `Team A: X | Team B: Y` em tempo real (com animação de barras de progresso simples).

---

### H-0502 — Detectar fim da partida quando algum time atinge 12 pontos
Como: observador do sistema,
Quero interromper o jogo assim que um dos times chega a 12 no placar,
Para anunciar vitória e limpar a mesa virtual.

**Critérios de aceite observáveis**:

1. Backend verifica após cada rodada de mão se `max(playerA_points, playerB_points) == 12`.
2. Se atingido → notifica "Vitória do time X! Partida encerrada" + animação de confetes (simples).
3. UI muda para tela final com resultado e botão "Nova partida".

---

### H-0503 — Lógica especial da "Mão de 10" — um time com 10 pontos
Como: jogador que está no limite inferior,
Quero impedir pedidos de truco quando só um time tem 10 pontos,
Para evitar que o time adversário perca automaticamente.

**Critérios de aceite observáveis**:

- Backend não aceita `increase_call = "truco"` se `team_points == [12, 0]` ou `[11, 9]` (sem mão ferro).
- Ao tentar pedir: UI exibe aviso "Não é possível pedir truco nesta situação" e nega automaticamente o pedido.

---

### H-0504 — Lógica especial da "Mão de Ferro" — ambos com 10 pontos
Como: sistema de decisão final de jogo,
Quero resolver quem ganha a partida ao virar cartas sem permitir truco,
Para decidir quem venceu pela manilha mais forte entre as duas equipes.

**Critérios de aceite observáveis**:

1. Se `teamA_points == 10 && teamB_points == 10`, inicia-se a "Mão Ferro" sem truco possível.
2. Jogadores revelam todas cartas simultaneamente; vencedor é o que tiver manilha mais forte (Zap ou Copas etc.).
3. Backend marca `"resultado: vitoria_imediata"` + notifica ao cliente: "Venceu por força! Partida encerrada."

---

## 🔄 EPIC 6 — Empate parcial e reconexão de sessão em tempo real

### H-0601 — Reconectar após falha de rede sem perda de cartas do jogador
Como: usuário que perdeu conexão,
Quero recuperar minhas cartas da rodada atual na mesma mão distribuída anteriormente,
Para que eu continue jogando a partir do último estado válido recebido.

**Critérios de aceite observáveis**:

1. Se WebSocket cai e depois recupera, a UI faz `sync_state_from_server` e verifica se minha mão mudou (não).
2. Cartas originais continuam ocultas até o momento atual.
3. Backend resume rodadas disputadas e anuncia quem ganhou as últimas rodadas antes da desconexão.

---

### H-0602 — Encerrar a partida após 30 segundos sem re-conexão do jogador ausente
Como: sistema de timeout,
Quero terminar a mão atual se um jogador não responder em 30s sem conexão,
Para liberar o segundo jogador e permitir nova partida com novo entrante.

**Critérios de aceite observáveis**:

- Backend registra `"last_heartbeat"` do player A ou B; se após 30s ainda null → marca `hand_abandoned = true`.
