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

> **Regra:** Em Truco Paulista, a manilha é definida por uma carta "virada" (o _vira_) antes de cada nova mão. As manilhas são as quatro cartas seguintes à sequência do vira. A força relativa das manilhas segue a hierarquia de suítes: `Paus > Copas > Espadas > Ouros` (Clubs > Hearts > Spades > Diamonds). **Não existe "manilha velha" (fixa) nesta variante.**

- Quando a carta virada (_vira_) é descoberta, ela define o próximo escalão de manilhas. Por exemplo:
  - Se vira = 5 → manilhas são todas as cartas ≥ 5 na hierarquia (i.e., 6, Q, J, K, A, 2, 3 — mais 4 dependendo do suíte).
  - A carta virada conta como uma manilha.

> **Nota importante:** Não há _mão de ferro_, nem mão de 11 ou de 10 (esses conceitos existem apenas em algumas variantes regionais ou são simplificações incorretas) e não existe _empate_ na mão inteira — a última rodada da mão decide sempre.

---

## 4. Pontuação — Escada de Aposta

Cada rodada tem um valor de aposta, escalonado conforme o pedido de truco feito durante a partida:

| Estado | Pontos por mão |
|--------|-----------------|
| Base   | 1 ponto         |
| Seis   | 3 pontos        |
| Nove   | 6 pontos        |
| Doze   | 9 pontos        |
| Truco (reiterado) | 12 pontos |

A partida termina quando um jogador atinge o primeiro limiar de pontos configurado no jogo (padrão v0.1: _primeiro a X_ para empate ou _primeiro a Y_ para vitória).

---

## 5. Manilha Rotativa (regra central de Paulista)

> **Regra:** Após cada mão finalizada, a próxima carta virada é selecionada para definir as novas manilhas da próxima mão — isso é chamado "manilha rotativa" no contexto desta partida online. O vira determina o novo escalão das manilhas na próxima mão. Isso mantém a dinâmica tática e torna imprevisível a força da mão do outro jogador.

> **Nota sobre fontes:** Termos como "_mão de onze_" ou mão de ferro não aparecem nas regras oficiais de Paulista; são conceitos de outras variantes (como Mineiro) mas devem ser omitidos em v0.1 para evitar complexidade desnecessária.

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