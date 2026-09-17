# Histórias de usuário — Fatia de Lobby (LOB-01..07)

**Tarefa:** t_9e3c460e
**Perfil:** produto (AUTHOR)
**Brief de referência:** BRIEF-TRUCO-v0.1-R1-20260916
**SHA-256 do brief:** `273d7760dc25b2641631a98a8d3aef352883d4a92469c145154285e9dd17d403`
**Escopo desta entrega:** detalhar LOB-01..07 em histórias pequenas com critérios Given/When/Then. Não implementa, não homologa, não rediscute escopo aprovado.

---

## Objetivo

Detalhar a primeira fatia (lobby funcional com dois navegadores) em histórias
pequenas e executáveis, com critérios de aceite **Given/When/Then**, cobrindo
explicitamente todos os IDs **LOB-01..07** do brief aprovado. As histórias
descrevem apenas o comportamento do **lobby**: apelido, criar/listar/entrar em
salas, duas sessões independentes em browsers distintos, rejeição de um terceiro
jogador, disputa pela última vaga sob entradas concorrentes e desconexão/abandono.

**Fora do escopo desta entrega:** implementação, PR/merge, deploy, release,
renderização 3D, regras de Truco Paulista e autenticação. "Sala completa" aqui
**não** significa partida implementada; não haverá botão que simule jogo entregue.

Complementarmente, este documento registra as **perguntas de regra do Truco**
que precisam de posicionamento de Produto/CEO **somente antes de V01-05**
(v0.1 completa), sem impedir a fatia de lobby aprovada.

---

## Decisões

Decisões de produto já aprovadas no brief e mantidas aqui (sem rediscussão):

1. **Apelido sem autenticação.** O visitante informa apenas um apelido; não há
   cadastro, login nem identificador de conta. O apelido **não identifica a
   sessão** (LOB-05): a identidade técnica é responsabilidade do CTO/Tech Lead
   (LOB-06).
2. **Apelidos iguais são permitidos** (LOB-05), pois o apelido é apenas um rótulo
   de exibição. Duas sessões podem ter o mesmo apelido sem conflito.
3. **Normalização de apelido:** trim das extremidades + faixa **1–20 caracteres**
   (proposta do brief), **inclusiva no limite superior: 20 é válido**. É rejeitado
   apenas o **vazio após trim** e o que tiver **mais de 20** caracteres. A mensagem
   de erro é exibida **sem execução de HTML/script** (texto puro, seguro XSS).
4. **Capacidade de sala = 2**, aplicada **no servidor**, inclusive sob entradas
   concorrentes (LOB-03/LOB-04). Sala cheia sai da lista de disponíveis.
5. **Duas sessões independentes** em browsers/ambientes distintos: mesma lógica,
   sem compartilhamento de estado no cliente; cada sessão é um "jogador".
6. **Experiência de espera/saída/pendência (LOB-06):** estados claros de usuário
   — "sala aguardando 2º jogador", "sala completa", "sala removida/inexistente",
   "conexão perdida". Abandono ou queda **não pode** deixar uma sala falsa
   disponível indefinidamente. O **timeout e a identidade técnica** são definidos
   pelo CTO/Tech Lead; o Produto documenta a experiência (perda de conexão,
   retorno, saída explícita).
7. **Sem botão de "jogo simulado".** Concluir o lobby é um **marco intermediário**;
   a v0.1 permanece ATIVA e não recebe HOMOLOGADA pela fatia de lobby.
8. **Nenhum agente revisa o próprio trabalho.** Testes existentes não podem ser
   apagados, ignorados ou enfraquecidos.

**Alternativas consideradas (decisão de produto, não técnica):**

- *Apelidos únicos obrigatórios* — descartado: criaria fricção e um banco de
  nomes sem propósito, já que o apelido não identifica a sessão. Mantido o
  permissivo (brief).
- *Sala com 1 ou 2 jogadores sempre listada* — descartado para a fatia: o brief
  define liste apenas salas aguardando o 2º jogador. Decisão ratificada.
- *Limite superior do apelido: >=20 rejeitado (20 inválido)* — descartado: entra
  em contradição com a faixa declarada "entre 1 e 20". Alinhado a **20 válido,
  rejeita vazio-após-trim e >20**.

---

## Critérios verificáveis

Histórias por LOB, com critérios **Given/When/Then**. IDs de história `LOB-xx-S##`
mapeiam para o LOB correspondente para rastreabilidade.

### LOB-01 — Apelido + criação de sala

**LOB-01-S01 — Exigir apelido válido antes de criar sala (parte LOB-01, LOB-05)**
- **Given** um visitante no lobby com o campo de apelido vazio,
  **when** ele tenta criar uma sala,
  **then** a criação é recusada, uma mensagem em texto puro é exibida ("Informe um
  apelido entre 1 e 20 caracteres") **e** nenhuma sala é criada nem HTML/script
  é executado a partir dessa entrada.

**LOB-01-S02 — Criar sala com identificador e estado de espera visíveis**
- **Given** um visitante com apelido válido (1–20 após trim) no lobby,
  **when** ele cria uma sala,
  **then** a sala é criada no servidor, um identificador único é exibido, o
  estado "aguardando 2º jogador" fica visível **e** a ação reflete sem recarregar
  a página.

### LOB-02 — Sessão independente vê a sala de A sem recarregar

**LOB-02-S01 — Listar salas aguardando sem recarregar**
- **Given** uma sessão A que criou uma sala aguardando 2º jogador,
  **when** uma sessão B, independente (browser/ambiente diferente), abre o lobby,
  **then** B vê a sala de A na lista de disponíveis, atualizada sem recarregar a
  página (atualização puxada/empurrada pelo servidor, conforme decisão do CTO).

**LOB-02-S02 — Sessões independentes, mesmo apelido permitido (LOB-05)**
- **Given** A e B com o mesmo apelido válido,
  **when** ambas estão no lobby,
  **then** ambas são tratadas como sessões/jogadores **distintos** e o apelido
  repetido não gera erro nem conflita.

### LOB-03 — Entrar em sala; ambos veem "sala completa"

**LOB-03-S01 — Entrar em sala disponível e ver dois participantes**
- **Given** uma sala disponível aguardando 2º jogador e um segundo jogador B,
  **when** B entra na sala,
  **then** o servidor registra 2 participantes; **A e B** veem os dois
  participantes e o estado "sala completa", atualizado sem recarregar.

**LOB-03-S02 — Sala cheia sai da lista de disponíveis**
- **Given** uma sala com 2 participantes,
  **when** a lista de salas é consultada,
  **then** essa sala não aparece como disponível para novos jogadores.

### LOB-04 — Rejeição do terceiro e disputa pela última vaga

**LOB-04-S01 — Terceiro cliente não entra em sala completa**
- **Given** uma sala com 2 participantes,
  **when** um terceiro cliente tenta entrar,
  **then** a entrada é rejeitada pelo servidor, uma mensagem de erro clara é
  exibida (sala cheia/indisponível) **e** o cliente vê a sala como indisponível.

**LOB-04-S02 — Duas entradas concorrentes pela última vaga (capacidade no servidor)**
- **Given** uma sala com 1 jogador (vaga única restante) e dois clientes C e D
  tentando entrar ao mesmo tempo,
  **when** ambos disputam a última vaga,
  **then** **exatamente um** entra com sucesso, o outro é rejeitado, e a sala
  resultante tem exatamente 2 participantes. Teste automatizado cobre essa
  concorrência no nível do servidor.

### LOB-05 — Apelido vazio rejeitado e exibição segura

Já coberto parcialmente em LOB-01-S01; reforço explícito, alinhado à faixa 1–20
inclusiva:

**LOB-05-S01 — Normalização e faixa 1–20 inclusiva, exibição segura**
- **Given** um apelido com espaços nas extremidades e/ou comprimento **vazio após
  trim** ou **maior que 20**,
  **when** o usuário submete,
  **then** o valor é truncado nas extremidades; apelido vazio-após-trim ou com
  **mais de 20** caracteres é rejeitado com mensagem de texto puro (20 é aceito)
  **e** a entrada é renderizada **sem** interpretação de HTML/script (ex.:
  `<script>` é tratado como texto, nunca executado).

**LOB-05-S02 — Apelidos iguais não identificam a sessão**
- **Given** duas sessões com o mesmo apelido,
  **when** ambas interagem no lobby,
  **then** o apelido não é usado como identidade técnica; eventos/mensagens
  distinguem as sessões por identificador técnico (definido pelo CTO), nunca pelo
  apelido.

### LOB-06 — Desconexão/abandono: experiência e não-sala-falsa

**LOB-06-S01 — Saída/abandono não mantém sala falsa disponível**
- **Given** uma sala criada cujo jogador sai ou perde a conexão,
  **when** o servidor detecta a queda (conforme identidade/timeout definidos pelo
  CTO),
  **then** a sala deixa de ser listada como disponível (ou é encerrada/limpa
  dentro da política documentada), sem permanecer falsamente "aguardando 2º".

**LOB-06-S02 — Criador cai/abandona antes de um 2º jogador entrar**
- **Given** uma sala com 1 jogador (criador) aguardando,
  **when** não há 2º jogador e o criador cai/abandona,
  **then** a sala é removida da lista de disponíveis conforme a política de
  timeout/limpeza, e a experiência de espera/saída é documentada (estado "sala
  removida/inexistente" claro para o lado ainda conectado, se aplicável).

**LOB-06-S03 — Documentação da experiência de espera/saída/pendência**
- **Given** a política de identidade/timeout definida pelo CTO,
  **when** a experiência de usuário é descrita,
  **then** o Produto entrega a especificação dos estados: aguardando, completa,
  removida, conexão perdida e retorno/abandono, com textos e ações previstas para
  cada caso (a execução não faz parte desta tarefa).

### LOB-07 — Automação, regressão, revisão, CI e QA em dois browsers

**LOB-07-S01 — Cobertura Red-Green e regressão dos cenários de lobby**
- **Given** os cenários LOB-01..06 codificados como testes,
  **when** a suíte roda,
  **then** ela começa Vermelha, torna-se Verde com a implementação, retorna Verde
  na regressão **e** nenhum teste pré-existente é apagado, ignorado ou
  enfraquecido.

**LOB-07-S02 — Revisão independente, CI e QA em dois browsers**
- **Given** a implementação da fatia,
  **when** CI e QA executam (dois navegadores, ex.: Chrome e Firefox),
  **then** os fluxos de lobby (criar/entrar/duas sessões/rejeitar terceiro /
  última vaga / desconexão) passam em ambos os navegadores, com evidências
  registradas referenciando o mesmo commit revisado de forma independente.

**LOB-07-S03 — Compose local saudável, URL e rollback comprovados**
- **Given** o ambiente Docker local de homologação,
  **when** o Compose sobe e é validado,
  **then** a URL local é acessível, os serviços estão saudáveis, e o procedimento
  de rollback é executado e comprovado (scope de DevOps/QA; o Produto registra a
  exigência, não a execução).

---

## Perguntas de regra do Truco — necessárias apenas antes de V01-05

Estas perguntas **não** bloqueiam a fatia de lobby. Serão posicionadas por
Produto/CEO somente quando a v0.1 completa (V01-05) entrar na esteira, para que
Produto apresente um **contrato de Truco Paulista para dois jogadores** sem
inventar variantes silenciosamente:

1. **Manilhas:** em Truco Paulista, quais cartas são manilhas (fixas vs. da vira)?
   e qual a hierarquia entre as quatro manilhas?
2. **Empates de rodada e de mão:** como pontua o empate de rodada/mão (quem
   leva, zera ou anula) quando não há vencedor claro?
3. **Escalada do truco / pedidos de aumento:** valores de aposta (truco, seis,
   nove, doze...), quem pode pedir, resposta (aceita/rejeita) e o que acontece na
   recusa.
4. **Mão de onze / ferro:** quando se aplicam, quem decide, e o comportamento
   quando um jogador não tem pontos de vitória suficientes.
5. **Abandono/desconexão durante a partida:** política de vencido/empate quando
   um jogador cai no meio (relaciona-se a LOB-06, mas no contexto de partida).
6. **Vitória:** contagem de mãos/partidas para fechar o jogo e ordem de quem joga
   primeiro cada mão/rodada.

Confirmar essas respostas **antes** da implementação de V01-05 é garantia de que
Produto apresenta o contrato explícito exigido pelo brief; não é obrigatório
respondê-las agora.

---

## Riscos e pendências

- **Dependência técnica (LOB-06):** o timeout e a identidade técnica que definem
  "sala não permanece disponível indefinidamente" dependem de decisão do
  CTO/Tech Lead. O Produto já especifica a experiência; a política numérica fica
  pendente da decisão técnica.
- **Meio de atualização em tempo real (LOB-02/03):** a atualização "sem
  recarregar" depende da escolha técnica (WebSocket/SSE/outra) que pertence ao
  CTO. O Produto exige o comportamento; a implementação não é desta tarefa.
- **Concorrência pela última vaga (LOB-04-S02):** o teste automatizado requer
  infraestrutura de teste no servidor; é cobertura obrigatória, mas a robustez
  sob concorrência é responsabilidade do CTO.
- **Perguntas de regra do Truco:** listadas acima; ficam pendentes de
  posicionamento do CEO/Produto **antes de V01-05**, sem bloquear o lobby.
- **Limite de escopo:** nenhuma das histórias cria partida simulada, 3D, chat,
  ranking ou autenticação. Qualquer desvio de escopo deve ser tratado como
  rediscussão não autorizada.