# Backlog do Truco Paulista v0.1 — Histórias por Epic

**Versão:** 0.1
**Status:** Em preparação para review
**Criador:** produto (rework post-revisão)

---

## Introdução

Este backlog descompõe o Product Brief aprovado em epics e histórias de usuário, alinhadas aos critérios de aceitação funcionais do Truco Paulista v0.1. As histórias abaixo devem entregar uma experiência jogável para duas pessoas num navegador local, respeitando as regras da variante Paulista (manilha rotativa, pontuação 1/3/6/9/12 por mão) e sem inventar elementos fora do escopo (como dealer, mao de ferro ou pontuações alternativas).

Depois deste backlog v0.1, o Tech Lead deve decompor em tasks técnicas específicas; o Designer deve transformar os critérios observáveis em fluxo visual e transição 2D→3D conforme o Brief.

---

## Epic 1 — Acesso sem cadastro

**Objetivo:** Permitir que duas pessoas jogue pelo navegador local sem conta nem autenticação, usando apenas apelido.

### História E1-01 — Criar ou entrar em uma sala

**Como usuário,** quero criar um jogo novo ou entrar em um jogo existente para poder jogar contra um amigo num mesmo computador (ou dois navegadores).

**Critérios de aceite:**
- O jogador pode criar uma nova sala ao clicar "Criar Jogo". A sala recebe um ID único.
- Ao criar uma sala, aparece no jogo uma lista de salas disponíveis com seus IDs e estado (disponível/ocupado), atualizada em tempo real para a sessão do criador.
- O jogador pode usar um apelido para sua primeira vez — sem cadastro, login ou senha. O apelido é validado contra o conjunto permitido e registrado no estado da sessão.
- Ao entrar em uma sala existente, o jogador insere seu apelido na lista de jogadores daquela sala (não há login). Se a sala tiver menos de dois jogadores, ele aparece como um dos participantes esperantes; se já tiver dois jogadores, recebe feedback de que a sala está cheia.
- A primeira vez que entra numa sala com um jogador ativo, o sistema mostra ao entrar o segundo jogador uma mensagem "Sala agora cheia" (ou similar) — sem necessidade de clique extra.

**Fora do escopo:**
- Persistência persistente entre sessões independentes (o Tech Lead definirá a estratégia); v0.1 só exige que um estado esteja sincronizado entre as duas sessões ativas da mesma partida.
- Sincronização multi-jogador além de dois participantes por sala.

**Observações:** Conforme o Brief, "criação e listagem de salas" devem ser observáveis sem implementação técnica prescrita. O Tech Lead decidirá cache vs banco local; o critério é que a lista apareça no navegador do criador sempre atualizada para sua sessão.

---

## Epic 2 — Lobby 2D e início da partida

**Objetivo:** Permitir lobby pré-partida (interface 2D) e transição automática ao ambiente 3D quando ambos jogadores entrarem.

### História E2-01 — Lobby com lista de jogadores

**Como jogador,** quero ver uma interface 2D antes da partida que me permita identificar quem está no jogo ou na fila para entrar como o segundo.

**Critérios de aceite:**
- A tela mostra a sala ativa (ou a do criador após clicar "entrar") com nome da sala, estado (disponível/ocupado) e lista com até dois apelidos (jogador 1 + jogador 2).
- Quando o segundo jogador entra pela primeira vez ao entrar na sala, a lista atualiza sem recarregar. O jogo fica aguardando que todos os dois jogadores estejam presentes — sem necessidade de um clique extra.

### História E2-02 — Iniciar partida quando o segundo jogador entra

**Como jogador,** quero que o jogo inicie automaticamente no ambiente 3D assim que o segundo participante entrar, sem precisar enviar um botão "Começar".

**Critérios de aceite:**
- Assim que o segundo jogador completa sua entrada (entrada finalizada com seu apelido), a transição automática ocorre: a interface muda da tela de lobby 2D do pro ambiente 3D do jogo. Nenhum outro clique ou envio manual é necessário.
- O ambiente 3D mostra mesa, peças representativas dos jogadores e espaço para cartas; as cartas de cada jogador permanecem ocultas antes de serem reveladas durante o jogo — privacidade absoluta (critério crucial do Brief).
- As ações do jogador são sincronizadas entre as duas sessões (quem fez qual ação é mostrado para ambos).

**Fora do escopo:**
- Mecânicas de animação complexas ou efeitos visuais além da coerência básica; o Tech Lead definirá níveis de qualidade mínimos aceitáveis.

---

## Epic 3 — Ambiente 3D e sincronização de estado

**Objetivo:** Fornecer um ambiente 3D responsivo com estado autoritativo compartilhado entre as duas sessões.

### História E3-01 — Transição para o ambiente 3D

**Como jogador,** quero passar a interface visual do lobby (que roda em 2D) ao jogo real que roda no navegador local quando a partida começa.

**Critérios de aceite:**
- Ao entrar a sala, a transição deve ocorrer automaticamente: primeiro a mensagem de "Sala agora cheia" e depois o ambiente 3D aparece.
- O ambiente 3D mostra mesa, jogadores representados visualmente e cartas privadas que não vaza informações para o oponente.
- A sincronização do estado (cartas em jogo, ações, placar) é idêntica entre as duas sessões; se um jogador pede truco ou corre, os dois refletem isso.

### História E3-02 — Privacidade das cartas durante a mão

**Como jogador,** quero ver apenas as minhas próprias cartas e não ver as do oponente antes da revelação por rodada.

**Critérios de aceite:**
- As cartas de cada jogador são mantidas privadas até serem mostradas rodada a rodada durante cada mano; não há vazamento de informação sobre a mão do adversário — critério explícito do Brief: "informações privadas, especialmente as cartas de cada jogador, não vazam para a interface do oponente".
- O jogador vê apenas sua própria carta no momento em que é pedido por ele durante a mão; quando é sua vez, pode ver suas duas cartas restantes.

---

## Epic 4 — Regras do Truco Paulista

**Objetivo:** Implementar regras válidas da variante Paulista para duas pessoas: manilha rotativa e pontuação escalonada.

### História E4-01 — Vira define as manilhas

**Como jogador,** quero que uma carta virada (_vira_) seja escolhida antes de cada mão, que defina as manilhas daquela mano conforme a regra Paulista (manilha rotativa).

**Critérios de aceite:**
- Antes de cada mano ativa, um vira é escolhido; o estado do jogo mostra quais cartas são manilhas nesta mão.
- Quando a carta virada é um escalão baixo na hierarquia normal, as manilhas são as cartas seguintes — mantendo a rotação dinâmica da mana de Paulista. O Tech Lead decidirá como esse vira é atribuído (carta de cada jogador? rotação automática?).

### História E4-02 — Escalação de aposta 1 → 3 → 6 → 9 → 12

**Como jogador,** quero que a aposta da mão seja escalonada conforme pedidos de truco: inicialmente 1 ponto, dobrando para 3 (seis), depois 6 (nove), depois 9 (doze) e depois 12 (truco).

**Critérios de aceite:**
- A mão começa com um valor de aposta inicial (padrão v0.1: 1); pedidos de truco seguem a escalada definida (1 → 3 → 6 → 9 → 12).
- Quando alguém pede truco, o estado da mano atualiza para o próximo valor e a aposta seguinte se torna o novo valor de base.

### História E4-03 — Rodada decide a mão; última rodada resolve

**Como jogador,** quero que cada rodada (vaza) tenha um vencedor, que ganha os pontos daquela rodada; quem perder a rodada não leva pontos da rodada nem da mão inteira.

**Critérios de aceite:**
- Cada mão tem várias rodadas (tricks); quem vencer mais rodadas leva a manobras e assim a mão. A última rodada é decisiva — não há empate na mão toda.
- Quem ganha uma rodada toma os pontos daquela rodada; o vencedor da mano é quem soma mais pontos nas três rodadas (ou menos se só houver uma ou duas) — mas apenas no limite de 12 total para ganhar a partida.

**Observação:** Não existem "empates" na mão inteira; as rodadas são ganhas por quem tem manilha e força, com a última rodada decidindo sempre. Empate de todas as mãos seria um empate da partida, mas o Brief define que "A partida termina ao atingir o limiar de pontos configurado".

---

## Epic 5 — Interface do resultado e encerramento

**Objetivo:** Mostrar quem ganhou cada mão e terminar a partida quando o primeiro jogador atinge o limiar de pontos.

### História E5-01 — Final da partida pelo limiar de pontos

**Como jogador,** quero saber quando a partida termina, com um resumo do resultado final (quem acumulou X pontos) para celebrar quem chegou primeiro ao objetivo configurado (limiar padrão 12).

**Critérios de aceite:**
- Quando um jogador acumula o número de pontos configurado (padrão v0.1: 12), a partida termina e aparece uma mensagem "Parabéns, X venceu!" ou similar, com o placar final.
- O histórico de mãos ganhas por cada participante pode ser exibido (opcional para design).

### História E5-02 — Resumos visuais para cada vitória e derrota

**Como jogador,** quero que cada mão mostre quem ganhou e quantos pontos a conta naquela mão, com um feedback rápido ao final da mano.

**Critérios de aceite:**
- Ao final de cada mão, o jogo exibe quem venceu aquela mão e quantos pontos foram ganhos no total para quem acumulou os pontos daquela mão (padrão v0.1: 1/3/6/9/12 por mão).
- O placar atual é sempre visível durante a partida (e.g., "Jogador A: 7 | Jogador B: 9") e atualiza após cada mão.

---

## Epic 6 — Qualidade, desempenho e observação técnica

**Objetivo:** Garantir experiência responsiva local com degradação visual adequada em hardware limitado.

### História E6-01 — Inicialização rápida e responsividade

**Como jogador,** quero que a aplicação carregue num segundo de abrir e responda sem delay excessivo durante jogadas (pedidos, revezações, correções).

**Critérios de aceite:**
- A primeira visita ao site local carrega em menos de cinco segundos numa rede doméstica típica — e o jogo já está interativo.
- As ações (truco, correr, revelar carta) são processadas rapidamente e refletem as duas sessões dentro de alguns ms a segundo.

### História E6-02 — Feedback quando a sala ocupa ou vira cheia

** Como jogador,** quero que o sistema me avise claramente se a sala está cheia ou não, para eu saber qual ação tomar agora.

**Critérios de aceite:**
- Quando um jogador tenta entrar em uma sala que já tem dois jogadores ativos, vê feedback como "Sala cheia" com sugestão simples (criar nova sala).
- A lista de salas mostra o estado (disponível/ocupado) e, se cheia, não permite nova entrada — sem erro genérico.

### História E6-03 — Privacidade visual durante a revelação

**Como jogador,** quero que cada rodada me permita revelar apenas minhas próprias cartas (não ver as do adversário), mantendo o mistério por rodadas antes de avançar para a próxima.

**Critérios de aceite:**
- Durante uma mão, quando é minha vez eu vejo minhas duas cartas restantes; não vejo as cartas do oponente — privacidade mantida até a revelação final da rodada.
- Se o adversário revela suas cartas, eu posso ver mas não tenho que revelar imediatamente — fluxo controlado pelo jogador.

---

## Epic 7 — Regressão e testes de contrato

**Objetivo:** Manter regras consistentes e comportamento observável entre releases.

### História E7-01 — Testes unitários de regra

**Como QA,** quero ter testes automatizados que verifiquem cada regra do Truco Paulista: cálculo da manilha, escalada de aposta, vira rotativo, resolução de rodadas, privacidade de cartas e transição para 3D.

**Critérios de aceite:**
- Testes unitários cobrem a lógica de regra (não a UI), incluindo casos limite como vira = carta alta vs vira baixa e manilha escalonada.
- Os testes verificam que cada mão segue a pontuação doBrief(1/3/6/9/12) e que empates na mão inteira são impossíveis (última rodada sempre decide).

### História E7-02 — Testes E2E de jornada completa

**Como QA**, quero um fluxo de teste end-to-end: duas sessões independentes abrem, criam ou entram numa sala, transiciona para 3D, joga uma mão inteira com truco/corre e chega ao fim da partida.

**Critérios de aceite:**
- O teste abre dois navegadores simulados, cria um jogo no primeiro e entra no segundo num segundo navegador. A listagem de salas aparece no primeiro como "ocupado" na segunda entrada.
- O teste executa a mão: vira define manilhas, cada rodada revela cartas e resolve pontos, mostrando quem ganha; o placar atualiza em ambas as sessões antes do encerramento pela condição de vitória (12 pontos).

### História E7-03 — Regressão para comportamentos de UI esperados

**Como QA**, quero que cada regressão verifique a lista de salas atualizada, transição 2D→3D, privacidade de cartas e feedback quando a sala está cheia.

**Critérios de aceite:**
- O teste abre duas sessões simuladas numa mesma máquina; o criador vê sua sala com estado "disponível" e a lista se atualiza para "ocupado" quando o segundo entra.
- Cada regressão verifica que as cartas do adversário não vazam e que o ambiente 3D só carrega após a entrada completa de todos os dois jogadores — sem transitar visualmente para o erro antes disso.

---

## Notas sobre critérios vs implementação

1. **Critérios devem ser observáveis:** Não escrevemos "implemente com Three.js" ou "use Socket.io"; definimos o comportamento que o sistema deve mostrar (lista atualizada, transição automática, ambiente responsivo).
2. **Registros do vira e da manilha:** O Tech Lead define como cada um desses mecanismos funcionam por baixo; Product apenas observa se a manilha muda conforme o vira de Paulista.
3. **Privacidade das cartas:** É um critério funcional explícito do Brief; qualquer vazamento visual é falha de critério, independentemente da causa técnica.
4. **Empate ou mão de ferro:** Não há empates na mão inteira nem regras como "mão de 11"; essas variações só existem em outras variantes (Mineiro) e não pertencem ao escopo v0.1.

---

## Glossário curto

- **Mão:** Competição de rodadas; ganha quem vencer mais rodadas naquela mão e leva os pontos acumulados.
- **Rodada (vaza):** Vez do traco; pode valer 1, 3, 6 ou 12 pontos dependendo da aposta atual.
- **Vira:** Carta revelada antes de cada mão que define as manilhas daquela mano (regra Paulista).
- **Manilha:** Cartas acima das comuns, variáveis conforme o vira.
- **Correr:** Quando um jogador desiste da mão ao ver pedida de truco impossível; entrega os pontos doponente.

---

**Handoff para Tech Lead:** Product entregou backlog estruturado por epics e histórias com critérios observáveis conforme o Brief e as regras de Paulista. O Tech Lead deve decompor em tasks técnicas específicas (frontend, backend local, 3D engine), decidir sobre persistência de estado (session storage vs in-memory) e planejar a transição visual 2D→3D.

---
