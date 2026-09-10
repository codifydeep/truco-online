# Regras do Truco Paulista (2 jogadores)

**Versão:** v0.1
**Data de publicação:** 2026-09-09
**Status:** Draft para homologação

---

## 1. Visão Geral

Uma partida de Truco Paulista consiste em disputar pontos por mãos, onde cada mão vale 1, 3, 6, 9 ou 12 pontos. O objetivo é alcançar o primeiro a determinado limiar de pontos (padrão: 12 pontos). Cada mão é composta por até três rodadas (_tricks_), e quem vencer a mão leva os pontos da aposta naquela mão.

**Fontes consultadas:**
- Copag — Afinal como se joga o Truco Paulista: https://blog.copag.com.br/blog/a-copag/afinal-como-se-joga-o-truco-paulista — acessado 2026-09-09.
- Jogatina — Regras do Truco Paulista: https://s3.amazonaws.com/static.jogatina.com/downloads/truco-paulista/regras-truco-paulista.pdf — acessado 2026-09-09.

---

## 2. Baralho e Cartas

- **Baralho:** 40 cartas (sem 8, sem 9, sem 10 e sem Joker).
- **Ordem de força das cartas comuns:** do mais forte para o mais fraco: `3 > 2 > A > K > J > Q > 7 > 6 > 5 > 4`. Suítes não afetam a hierarquia entre as cartas comuns.
- **Manilhas (cartas acima da força normal):** Determinadas pelo _vira_ da partida. As manilhas são variáveis em cada mão.

---

## 3. Manilhas — Regra Confirmada de Paulista

> **Regra:** Em Truco Paulista, a manilha é definida por uma carta "virada" (o _vira_) antes de cada nova mão. A carta do vira NÃO é manilha; ela define exatamente as quatro cartas do valor imediatamente seguinte na hierarquia como manilhas da próxima mão. A força relativa das manilhas segue a hierarquia de suítes: **Paus > Copas > Espadas > Ouros** (Clubs > Hearts > Spades > Diamonds). **Não existe "manilha velha" (fixa) nesta variante.**
- Quando o vira é determinado, as 4 cartas imediatamente superiores na hierarquia viram manilhas.
- O próprio vira NÃO pontua como manilha em nenhum escalão — apenas as cartas seguintes à sua posição no escalão comum.

> **Mão de Onze e Mão de Ferro (adaptação v0.1):** Para esta adaptação 1x1, aos 11 o próprio jogador decide jogar por 3 ou correr cedendo 1; em 11x11 ambos jogam sem ver as próprias cartas e não podem pedir aumento. Essas duas adaptações São decisões explícitas da v0.1 derivada das regras em duplas.

> **Empate na mão:** empate na primeira faz o vencedor da segunda ganhar a mão, empate na segunda ou terceira favorece quem venceu a primeira, primeira e segunda empatadas levam a decisão para a terceira, três empates não pontuam; a partida termina em 12.

---

## 4. Pontuação — Escada de Aposta

Cada mão tem um valor de aposta, escalonado conforme os pedidos de aumento durante a partida. A sequência é: Base (1) → Seis (3) → Nove (6) → Doze (9) → Truco (12). O valor aumenta em cada pedido de truco aceito.

| Estado | Pontos por mão |
|--------|-----------------|
| Base         | 1 ponto            |
| Seis   (pedido)   | 3 pontos           |
| Nove   (pedido)   | 6 pontos           |
| Doze   (pedido)   | 9 pontos           |
| Truco  (pedido final) | 12 pontos       |

**Nota sobre empates:** empate na primeira mão faz o vencedor da segunda ganhar a parte, empate na segunda ou terceira favorece quem venceu a primeira; primeiro e segundo empatados levam à decisão para a terceira, três empates não pontuam.

---

## 5. Manilha Rotativa (regra central de Paulista)

> **Regra:** Após cada mão finalizada, a próxima carta virada é selecionada para definir as novas manilhas da próxima mão — isso é chamado "manilha rotativa" no contexto desta partida online. O vira determina o novo escalão das manilhas na próxima mão. Isso mantém a dinâmica tática e torna imprevisível a força da mão do outro jogador.

> **Nota sobre fontes:** Termos como "mão de onze" ou mão de ferro não aparecem nas regras oficiais de Paulista; São conceitos de outras variantes (como Mineiro) mas foram incluídos na v0.1 como adaptação explícita para partidas 1x1.

---

## 6. Fluxo de cada partida (resumo observável)

1. O jogo abre e permite criar uma sala ou entrar em uma existente.
2. **Apelido do jogador 1** é registrado primeiro.
3. O **jogador 2 entra depois**, via lista de jogadores disponíveis — não há cadastro; apenas entrada por apelido.
4. Ao completar o segundo jogador, a **mão inicial ocorre automaticamente**.
5. Para cada mão nova:
   - Um _vira_ é escolhido (mecanismo definido pelo CTO).
   - As cartas do jogador são mantidas privadas durante a distribuição e revelação por rodada.
6. Cada rodadavale1,3,6ou12pontosconformemãoapostaativa.
7. A partida termina ao atingir o limiar de pontos configurado (padrão: 12).

---

## 7. Critérios de Aceite (observáveis, não implmentação técnica)

- O jogador pode criar ou entrar em uma sala usando apenas um apelido.
- O segundo jogador só entra quando a sala está com dois jogadores — sem autenticação.
- As cartas de cada jogador **não são visíveis** para o oponente antes da revelação por rodada.
- O vira é escolhido antes de cada mão e define as manilhas daquela mão (regra de Paulista).
- A pontuação evolui conforme a escalada: 1 → 3 → 6 → 9 → 12 pontos por mão.
- A última rodada da mano decide a vitória e o ganho de pontos configurado para aquela mão.
- Não existe empate na mão inteira — a última rodada resolve com quem ganha a mão ou não.

---

## 8. Fora do Escopo (v0.1)

- Variante Truco Mineiro (com manilhas fixas) e Gaudério/Cego são diferentes — esta é apenas Paulista.
- Quadros de pontuação persistentes, ranking global ou partidas com mais de dois jogadores.
- Chat social, matchmaking automático ou sistema de contas permanentes.
- Implementação técnica específica (_Three.js_, _Socket.io_, etc.) — essas escolhas pertencem ao CTO.

---

**Revisão subsequente:** Estas regras constituem o escopo funcional mínimo do v0.1. O Tech Lead pode decompor em histórias de backlog; o Designer pode transformar os critérios observáveis em fluxos de tela e transição de estado 2D → 3D conforme o Brief.

---