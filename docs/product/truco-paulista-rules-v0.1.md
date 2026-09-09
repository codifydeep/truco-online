# Regras e critérios detalhados — Truco Paulista (v0.1)

## 1. Objetivo deste documento

Descrever, de forma observável e implementável, todas as regras do Truco Paulista para partida com **duas pessoas** (time único contra o time adversário). Serve como fonte de verdade para implementação frontend/backend. Não contém HTML, código ou mockups — apenas especificações textuais que podem ser validadas por E2E.

## 2. Variáveis e termos definidos

- **Mão**: conjunto de 3 cartas na qual um jogador joga.
- **Rodada**: disputa de uma carta individual (trick) dentro de uma mão.
- **Mão simples**: sem truco, vale 1 ponto por rodada ganha.
- **Truco aceito**: valor da mão sobe para 3 pontos nas rodadas seguintes.
- **Vale 6 / Vale 9 / Vale 12**: aumentos sucessivos ao truco.
- **Manilha (manilha nova)**: cartas acima da vira, válidas apenas naquele turno.
- **Zap (Gato)**: manilha de Paus — mais forte do jogo.
- **Mão de 11**: quando um time tem 10 pontos antes da distribuição.
- **Mão ferro**: ambos os times com 10 pontos — regra especial descrita em 9.

## 3. Condições iniciais

### 3.1 Jogadores e sessões

- Duas sessões do navegador, cada uma representando um jogador (Player A / Player B).
- Cada jogador informa apenas um apelido na URL (ex: `?alias=alice`).
- O estado da partida é único e sincronizado via WebSocket/long-polling.

### 3.2 Baralho e preparação do jogo

- **Baralho**: 40 cartas — remove-se os 8, 9 e 10 de todos os naipes.
- **Naipes padrão**: Paus (Clubs), Copas (Hearts), Espadas (Spades), Ouros (Diamonds).
- **Cartas disponíveis**: A(K), 2, J(Q), K(J vale valete — ver hierarquia em 5.1), Q, 7, 6, 5, 4, 3.

### 3.3 Distribuição inicial

- As cartas são embaralhadas e distribuídas **uma por uma** ao jogador da mão (dealer).
- A ordem do dealer segue: Player A -> Player B -> Player A...
- Cada jogador recebe **exatamente 3 cartas**. Todas as cartas distribuídas; ninguém passa nem "burna" cartas.

### 3.4 Virada e definição das manilhas da mão corrente

- Após a distribuição das 3 cartas para cada jogador, uma carta é virada (vira).
- A vira é o **topo restante do baralho** ou a última carta não distribuída.
- As **manilhas** são as quatro cartas imediatamente acima da vira na sequência cíclica:

```
Ordem das manilhas pela força (mais forte -> mais fraca):
  Paus      (Clubs)    > Copas    (Hearts)    > Espadas (Spades)    > Ouros (Diamonds)
```

- Se a vira for **4** → manilhas são os **5**.
- Se a vira ser **5** → manilhas são os **6**.
- Se a vira for **6** → manilhas são os **7**.
- ... até que a vira seja **3** (a carta mais forte comum) → as manilhas são os **4**.

A ordem da vira cíclica: 4 → 3 → 2 → A → K → J → Q → 7 → 6 → 5 → 4...

- Cartas comuns em ordem de fraqueza para força (exceto quando a manilha compete):
```
4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3
```

### 3.5 Determinação do dealer inicial pela vira

- Quem recebe primeiro é decidido por quem tem no baralho restante (topo não distribuído) a carta mais alta comum entre os dois jogadores, comparando-se as cartas viradas e não distribuídas.
- Na prática: após receber 3 cartas cada, se o deck ainda tiver cartas em cima, vira-se uma carta para resolver quem inicia a mão.

## 4. Fluxo de jogo — mão por mão

### 4.1 Início da mão

- O jogador cedido inicia com uma das três opções:
  1. **Baixa**: joga uma carta da sua mão (selecionada no cliente antes do clique).
  2. **Pedir Truco**, desde que não seja a primeira rodada em tempo de "desconhecer cartas" — ver 7.
- Se o time adversário aceitar, as manilhas ainda valem e o turno vale agora **3 pontos**.
- Caso contrário (declinar), o time iniciador ganha **+1 ponto** na mão sem revelar cartas.

### 4.2 Primeira rodada — "Rodada de descobrimento"

- Apenas a primeira rodada exige que ambos revelem cartas antes de jogar a segunda (se houver).
- A regra clássica: **não vale esconder** na primeira; quem baixar no início da mão, revela imediatamente.

### 4.3 Segunda e Terceira rodada — "Rodadas do duelo"

- O jogador que ganhou a última rodada começa a jogada seguinte.
- Se for empate entre jogadores opostos (A>B e B<A nos dois primeiros), quem iniciou a mão joga novamente na terceira.
- Após três rodadas, o time com maior soma de rodadas ganha a mão.

### 4.4 Vence a rodada

- Para cada rodada:
  - O jogador do time "na vanguarda" baixa uma carta.
  - O adversário responde com sua melhor carta (ou manilha se tiver).
- Se o time da resposta tiver carta >= à do iniciador (incluindo hierarquia de manilhas), ele **ganha a rodada**.
- Empate em duas rodadas: time que jogou primeiro joga novamente na terceira.

### 4.5 Jogo normal — hierarquia das cartas comuns e manilhas

#### Comparações entre cartas comuns

```
Ordem crescente (mais fraca -> mais forte):
  4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3
```

- Naipe é irrelevante para a hierarquia; apenas o valor importa.
- Manilhas sempre vencem: qualquer manilha > qualquer carta comum.

#### Comparação entre manilhas

Manilhas na ordem de força (mais forte -> mais fraca):

```
Paus (Clubs)    = Zap / Gato     > Copas (Hearts)   > Espadas (Spades)  > Ouros (Diamonds)
```

- Quando duas cartas comuns competem, o naipe não importa.
- Quando uma manilha entra em disputa, só a hierarquia de manilhas acima vale.

### 4.6 Jogo do "na vanguarda"

- Se um jogador possui a mais forte ou empatado com o adversário no topo da sua carta, ele ganha a mão automaticamente.
- A estratégia envolve pressionar com a força nas rodadas.

## 5. Pedidos de aumentos — Truco, Vale 6, Vale 9 e Vale 12

### 5.1 Regras gerais de pedidos

- Apenas o jogador cuja vez é (turno dele) pode pedir **Truco**.
- O pedido só vale na mão corrente; não pode ser feito em outra rodada da mesma mão (essa restrição está no card).

### 5.2 Primeiro pedido — Truco

- Se Aceito: a mão passa a valer 3 pontos nas rodadas seguintes, e as regras normais continuam aplicáveis.
- Se Negado: o time desafiador ganha **+1 ponto** (pontuação acumulada) naquela rodada sem revelar cartas.
- A decisão de aceitar ou negar é tomada pela equipe adversária — ambos podem olhar mãos e deliberar se quiserem aceitar.

### 5.3 Segundo pedido — Vale 6

- Se o time desafiador ainda tem tempo, pode pedir **Vale 6**.
- Aceito: a mão agora vale 6 pontos nas rodadas seguintes, e as regras normais continuam aplicáveis.
- Negado: o time desafiador ganha **+3 pontos** (equivalente ao truco aceito) na mão sem revelar cartas.

### 5.4 Terceiro pedido — Vale 9

- Se ainda houver tempo para aumentar, pode-se pedir **Vale 9**.
- Aceito: a mão passa a valer 9 pontos nas rodadas seguintes.
- Negado: o time desafiador ganha **+6 pontos** na rodada sem exibir cartas.

### 5.5 Quarto pedido — Vale 12

- Se ainda houver tempo, pode-se pedir **Vale 12**.
- Aceito: a mão agora vale **12 pontos** nas rodadas seguintes — vitória total para o desafiador caso ganhe todas as rodadas da mesma.
- Negado: o time desafiador gains **+9 pontos** na rodada sem exibir cartas.

### 5.6 "Mão de 11" e restrição no truco final

- Quando um time tem **10 pontos** antes da distribuição: **não pode pedir Truco**.
- O time com 10 pontos só pode aceitar ou se defender dos pedidos, mas não aumentar o valor da mão.
- Se o outro team pedir, eles aceitam para ganhar +3 ou negam e perdem +9 a favor do desafiador — mas isso acontece quando ambos times atingem 10 pontos simultaneamente (Mão Ferro).

### 5.7 Pedido de truco na primeira rodada — tática de pressão

- Pedir Truco na primeira rodada (antes que o adversário verifique a força das cartas dele) é uma jogada estratégica:
  - Sobres os pontos da mão para **3** antes dos adversários conhecerem a real força das cartas deles.
  - Isso coloca pressão psicológica e força matemática sobre eles.

## 6. Placar e fim de partida — Vitória por pontos acumulados

### 6.1 Pontuação por tipo de resultado

| Resultado da mão                          | Pontos atribuídos                              |
|-------------------------------------------|-------------------------------------------------|
| Mão simples (1 ponto, sem truco)         | Ganha quem ganhar >2 rodadas = +1                |
| Truco aceito                             | Ganha quem vencer o turno = +3                   |
| Vale 6 aceito                            | Ganha quem vencer o turno = +6                   |
| Vale 9 aceito                            | Ganha quem vencer o turno = +9                   |
| Vale 12 aceito                           | O time que ganha a mão ganha a partida           |
| Negado Truco em primeira rodada          | Desafiador ganha +1                             |
| Pedir truco contra time com 10 pontos    | Desafiador perde automaticamente, adversário ganha +1 |

### 6.2 Quando uma mão decide o jogo

- Se um dos times chegar a **12 pontos** antes do fim da partida oficial — ele vence imediatamente.
- O jogador que atinge esse marco vence sem precisar finalizar rodadas restantes.

### 6.3 "Mão de Ferro" — ambos os times com 10 pontos

- Quando ambos os times têm exatamente **10 pontos**, a mão seguinte é classificada como uma "mão de ferro".
- Nesse caso, não há truco nem aumentos; o jogo é decidido por um único round: vira-se as cartas e quem tiver manilha mais forte vence.
- A regra é intencionalmente punitiva para evitar que alguém peça um valor alto demais contra um time já em vantagem final.

### 6.4 "Mão de 10" — um time com 10 pontos

- Se apenas um dos times tem **10 pontos**, o adversário ganha automaticamente a mão seguinte sem disputa de truco, pois a chance de perder a última rodada seria muito alta.
- A regra aqui é evitar que alguém peça um aumento contra um time já praticamente vencedor.

### 6.5 Fim de partida — quem atinge 12 pontos primeiro?

- O jogo termina assim que algum time alcança **12 pontos** no placar.
- Não há necessidade de aguardar rodadas adicionais.

## 7. Empates e regras especiais

### 7.1 Empate em duas rodadas

- Se as primeiras duas rodadas forem empatadas (A>B, B>A), quem iniciou a mão joga novamente na terceira rodada.
- O objetivo é ter uma vitória clara em uma das três rodadas.

### 7.2 Pedido de truco na última rodada da "mão de 11"

- Se o time com 10 pontos (que agora está jogando como "time adversário") pedir truco, o desafiador perde automaticamente a mão inteira sem necessidade de revelar cartas.
- A regra é: quem tem 10 pontos não pode pedir — se pedir, perde +3 à mão.

## 8. Manilhas sinalizadas (comunicação entre parceiros)

### 8.1 Sinais permitidos apenas para o parceiro imediato

- **Piscar** = indica Paus / Zap = manilha mais forte.
- **Sobrancelha** = indica Copas.
- **Bochecha** = Espadas.
- **Língua** = Ouros.

- Estes sinais são apenas entre os dois jogadores do mesmo time. Eles são invisíveis ao oponente e servem estritamente para comunicação de mãos (com parceiros).
- Não é permitido transmitir esses sinais aos adversários — eles só devem ver a vira e manilhas públicas.

## 9. Abandono e reconexão da partida em tempo real

### 9.1 Abandono do jogador

- Se um jogador fechar o navegador inesperadamente ou perder conexão, o servidor mantém o estado da mão atual (turno mais recente).
- A sessão pode se reconectar automaticamente no próximo momento de interação válida após a perda.

### 9.2 Recuperação do estado após desconexão

- O servidor persiste o estado da partida: turnos jogados, cartas distribuídas, manilhas atuais, placar acumulado e rodadas disputadas.
- Se um jogador se reconecta com sucesso, ele recarrega sua mão local com as mesmas 3 cartas que receber na distribuição.
- As cartas não valem para o jogador desconectado; apenas o estado do turno mais recente é recuperado.

### 9.3 Abandono intencional da partida — consequências

- Se um jogador abandona a parte (fecha navegador, limpa cache ou sai do jogo), ele perde automaticamente a partida se não puder retornar.
- O servidor considera abandono como falha de conexão e permite que o oponente continue jogando sozinho até que o tempo limite seja atingido (ex: 1 minuto).

### 9.4 Limite temporal para reconexão

- Se um jogador estiver ausente por mais de **30 segundos**, o jogo é considerado "inativo" e a mão atual pode ser encerrada automaticamente.
- No fim do tempo ou se ambos os jogadores desconectam simultaneamente, a partida é finalizada como empate sem pontos.

## 10. Critérios de aceite observáveis para E2E

### 10.1 Comportamentos esperados — requisitos mínimos v0.1

1. **Distribuição inicial correta**: cada jogador recebe exatamente 3 cartas antes da primeira jogada em uma mão.
2. **Virada consistente**: após a distribuição, uma carta é virada e as manilhas são definidas corretamente na primeira rodada da mão.
3. **Hierarquia de manilhas válida**: Paus > Copas > Espadas > Ouros sempre prevalece quando duas cartas competem.
4. **Ordem de valor das cartas comuns verificável**: 4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3 dentro do mesmo naipe ou manilhas.
5. **Truco pedido e aceito na mão simples**: a rodada seguinte vale +3 pontos após truco aceito.
6. **Mão de 10 não admite aumento**: um jogador com 10 pontos não pode pedir truco — se pedir, perde automaticamente sua mão.
7. **Mão ferro decide por força da melhor carta**: ambos times com 10 pontos — quem tiver a manilha mais forte ganha a partida.
8. **Reconexão de sessão**: um jogador que sai e retorna deve ver o mesmo estado da mão atual (mesmas cartas).
9. **Abandono reconhecido**: fechar o navegador encerra o jogo automaticamente após 30 segundos sem resposta.

### 10.2 Regras que não devem ser implementadas agora — explicitamente fora do escopo v0.1

- Curinga ("Três e meio").
- Empate técnico com rodadas de compensação além de três.
- Manilha fixa (não, apenas manilha nova).
- Jogo com mais de dois jogadores simultaneamente.
- Chat ou comunicação social entre jogadores — apenas sinais simples visuais entre times.
- Persistência de partidas após o timeout de 30 segundos sem reconexão.

## 11. Decisões de implementação pendentes para a equipe técnica

### 11.1 Stack e estado sincronizado

- **Three.js**: renderização da mesa e cartas no ambiente 3D.
- **WebSocket/Socket.io**: sincronização do estado entre duas sessões (server local via Docker).

### 11.2 UI para vira e manilhas públicas

- Exibir a carta virada em destaque na mesa virtual, com indicador de "manilhas ativas".
- As manilhas não devem ser visíveis aos jogadores — apenas a hierarquia pública do Zap e das outras cartas de alta força é mostrada.

### 11.3 Validação de hierarquia da carta em tempo real

- Função backend que verifica: `isValidCardHierarchy(card)` = retorna ordem crescente conforme seção 5.
- Na interface, exibir as manilhas ordenadas do mais forte para o mais fraco quando viradas.

### 11.4 Restrição de truco na "mão de 10"

- O backend não deve aceitar pedidos de truco quando um time tem 10 pontos e nenhum aumento anterior já aconteceu.
- Se o usuário tentar pedir nessa condição, o sistema exibe erro amigável e nega automaticamente o aumento.

---

**Status**: Documento completo para implementação v0.1.  
**Autor**: Perfil produto (Gerente de Produto).  
**Data**: 9/09/2026  
**Revisão técnica pendente**: @techlead_truco_poc_bot — verificar integração das hierarquias e restrições no backend e frontend.

