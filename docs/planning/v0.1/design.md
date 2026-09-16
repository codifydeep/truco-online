# Design de Produto — Lobby do Truco Online (Truco Paulista para 2 jogadores)

**Tarefa:** t_97deb23b
**Perfil:** designer (AUTHOR)
**Brief de referência:** BRIEF-TRUCO-v0.1-R1-202616 (SHA-256 `273d7760dc25b2641631a98a8d3aef352883d4a92469c145154285e9dd17d403`)
**Escopo:** especificar fluxos e estados do lobby em português, a partir das histórias aprovadas (LOB-01..07) e da fatia do Produto (`t_10ca48e7`): entrada/apelido, vazio/carregando/erro, criação/espera, disputa/lotação, desconexão e transição pré-jogo. Inclui acessibilidade, responsividade desktop e mapeamento LOB. **Wireframes textuais** — sem HTML/JS, sem implementação 3D nesta etapa.
**Estado:** DESIGN — documento de design; não implementa, não homologa, não revisa o próprio trabalho.

---

## Objetivo

Definir a experiência do **lobby** do Truco Paulista para dois jogadores em navegador desktop, cobrindo:

1. **Entrada/apelido** — informar um apelido (1–20 caracteres após trim, vazio rejeitado, sem autenticação).
2. **Estados de tela** — vazio, carregando e erro, com textos claros e sem execução de HTML/script.
3. **Criação/espera** — criar sala, identificador visível, estado "aguardando 2º jogador", atualização sem recarregar.
4. **Disputa/lotação** — entrar em sala, ver os dois participantes e "sala completa"; terceiro rejeitado; sala cheia sai da lista.
5. **Desconexão** — espera/saída/queda, sem manter sala falsa disponível indefinidamente (política numérica do CTO).
6. **Transição pré-jogo** — de "sala completa" para o início da partida (marco intermediário; a v0.1 permanece ATIVA).

Entregáveis deste documento: **mapa de fluxos**, **estados de tela com wireframes textuais**, **padrões de acessibilidade**, **responsividade desktop**, **mapeamento LOB→design**. Não define arquitetura, protocolo, identidade técnica, timeout nem renderização 3D — essas decisões pertencem ao CTO/Tech Lead.

---

## Decisões

Decisões de design de produto fundamentadas no brief e nas histórias aprovadas:

1. **Apelido como rótulo de exibição, não identidade.** O visitante informa apenas o apelido; ele não identifica a sessão. Apelidos iguais são permitidos. A identidade técnica é do CTO (LOB-05/LOB-06).
2. **Normalização do apelido:** trim das extremidades + faixa **1–20 inclusiva** (20 válido; rejeita vazio-após-trim e >20). Erro renderizado como **texto puro**, nunca executando HTML/script (LOB-05).
3. **Entrada em sala validada pelo servidor** (no cliente, apenas feedback imediato/visual). Capacidade de sala = 2, aplicada no servidor; sala cheia sai da lista de disponíveis (LOB-03/04).
4. **Atualização sem recarregar a página é requisito** (LOB-02/03): lista e estados refletem mudanças em até 1s (p95) no host de homologação. O meio técnico (WebSocket/SSE/outro) é escolha do CTO; o design apenas depende da **paridade entre navegadores independentes**.
5. **Design de estados explícitos** do lobby: vazio, carregando, erro, sala disponível, aguardando 2º, sala completa, sala removida/inexistente, conexão perdida, transição pré-jogo. Nenhum estado ambíguo ou "falso disponível".
6. **Sem botão de "jogo simulado".** "Sala completa" não significa partida; a transição pré-jogo é apenas a passagem para o estado de partida (a ser implementado em fases posteriores). Não há atalho que engane o usuário (brief).
7. **Responsividade desktop mínima:** viewport a partir de **1280×720** (Chrome e Firefox), com layout fluido que não quebra em janelas maiores; telas do lobby podem ser 2D (3D só na partida, fora desta etapa).
8. **Acessibilidade como critério:** navegação por teclado completa, foco visível, contraste adequado (WCAG AA), leitores de tela (`aria-live` nos estados/erros), alvos de clique ≥ 44×44 e textos de erro associados ao campo (não apenas visuais).

**Alternativas consideradas (design, não técnica):**
- *Tela única combinando apelido, criar e listar de uma vez* — descartado: mistura tarefas com pesos diferentes, prejudica foco e leitura para leitores de tela. Mantidas etapas claras (apelido → ação).
- *Listar todas as salas, inclusive cheias* — descartado: contradiz o brief (listar apenas aguardando 2º). Sala cheia desaparece da lista.
- *Atualização por botão manual "atualizar"* — descartado como único meio: o briefly exige atualização sem recarregar; botão manual seria redundante e não substitui a exigência.
- *Permitir apelido > 20 com truncamento* — descartado: rejeita e informa; truncar silenciosamente esconderia a regra.

---

## Fluxos (mapa geral)

Fluxo principal do lobby:

```
[Início do lobby]
      │
      ▼
[Apelido] ──vazio//>20──▶ [Erro de apelido (texto puro)]
      │ válido
      ▼
   [Escolha]
   ├──▶ "Criar sala" ──▶ [Criar][carregando] ─▶ [Espera: aguardando 2º] ──(B entra)──▶ [Sala completa]
   └──▶ "Entrar na sala dá lista" ──▶ [Lista de salas][carregando/erro] ─▶ clicar em sala
              ──disputa última vaga──▶ [Sala completa] (exatamente 1 entra; outro erro)
                      │                                     │
   Durante espera/completa: [Conexão perdida] / [Sala removida]  │
                                 └──────────────────────────────▼
                                             [Transição pré-jogo]  (marco intermediário, ainda 2D — partida não implementada)
```

Estados de tela obrigatórios e sua transição:

| Estado | Gatilho de entrada | Saída |
|---|---|---|
| `vazio` | lobby sem apelido ainda informado | digita apelido válido ou erro |
| `carregando` | envio de criação/lista/entrada | sucesso ou erro |
| `erro` | falha (rede/servidor/validação) | nova tentativa |
| `lista-disponiveis` | sessão independente abre lobby | cria ou entra |
| `aguardando-2o` | sala criada, 1 participante | 2º entra / queda / saída |
| `sala-completa` | 2 participantes | transição pré-jogo / queda |
| `sala-removida` | sala encerrada/não existe | retorna ao lobby |
| `conexao-perdida` | queda de rede durante espera | reconexão ou retorno |
| `transicao-pre-jogo` | ambos prontos na sala completa | inicia a partida (fase posterior) |

---

## Critérios verificáveis

Cada critério é verificável por inspeção de design (wireframes textuais, textos, acessibilidade e responsividade) e mapeia para LOB. Não depende de implementação.

### A. Entrada/apelido e estados vazio/carregando/erro

- **D-A01 (LOB-05/LOB-01):** o wireframe da tela inicial mostra um campo de apelido com rótulo visível, contador de limite e instrução "entre 1 e 20 caracteres". Após trim, vazio é tratado como inválido; 20 é válido; >20 é inválido.
- **D-A02 (LOB-05):** o estado de erro de apelido exibe mensagem em **texto puro** (ex.: "Informe um apelido entre 1 e 20 caracteres") vinculada ao campo via `aria-describedby`, sem execução de HTML/script. A mensagem é anunciada por leitor de tela (`aria-live="assertive"`).
- **D-A03 (LOB-01):** o botão "Criar sala" só fica habilitado com apelido válido; caso contrário fica desabilitado e/ou exibe o erro. Wireframes cobrem os três estados visuais do campo: válido, inválido e neutro.
- **D-A04:** o estado `carregando` tem feedback visível (indicador) e é anunciado (`aria-busy`); o estado `erro` de rede oferece ação clara de "Tentar novamente" e não apaga o apelido já digitado.

### B. Criação/espera

- **D-B01 (LOB-01/LOB-02):** o wireframe da tela de espera mostra: identificador da sala em destaque (copiável), nome/apelido do criador, estado "aguardando 2º jogador", e um botão claro de "Sair da sala". Atualiza sem recarregar.
- **D-B02 (LOB-02):** o wireframe da lista de salas disponíveis mostra cada sala com criador e estado "aguardando 2º", atualizado sem recarregar (paridade entre navegadores independentes).
- **D-B03 (LOB-02/LOB-05):** apelidos iguais em salas distintas são representados como linhas independentes na lista, sem conflito visual que os una.

### C. Disputa/lotação e sala completa

- **D-C01 (LOB-03):** o wireframe da "sala completa" mostra os dois participantes (apelidos) e o estado "sala completa", com ênfase visual; a tela de espera do 2º muda para a de ambos prontos sem recarregar.
- **D-C02 (LOB-04):** sala cheia some da lista de disponíveis no wireframe; o terceiro cliente não encontra atalho para entrar e, se tentar por URL/ID, recebe mensagem clara "sala cheia/indisponível" (texto puro).
- **D-C03 (LOB-04):** na disputa da última vaga, apenas um participante passa para "sala completa"; o outro recebe o mesmo estado de erro indisponível. O design prevê que a competição acontece no servidor (decisão do CTO); o cliente mostra apenas o resultado.
- **D-C04:** o botão/área de entrada em sala tem alvo ≥ 44×44 e rótulo acessível (nome da sala + criador + "entrar").

### D. Desconexão e transição pré-jogo

- **D-D01 (LOB-06):** estados `sala-removida` e `conexao-perdida` têm wireframes e textos claros ("Sala não encontrada"/"Conexão perdida, reconectando..."), com ação de voltar ao lobby e tentar novamente. Nunca há indicador de "aguardando 2º" em sala falsa.
- **D-D02 (LOB-06):** se o criador cai antes do 2º entrar, o design prevê a remoção da sala da lista (política de timeout do CTO); o lado ainda conectado, se aplicável, vê "sala removida/inexistente".
- **D-D03 (brief/fatia):** o wireframe de `transicao-pre-jogo` indica que ambos estão prontos na sala completa e é o limite desta etapa — não há botão que simule partida nem renderização 3D aqui. A transição real para a partida é fase posterior.
- **D-D04 (V01-08):** a especificação descreve que todo estado de espera, erro, desconexão e fim inclui feedback claro e um caminho de retorno (voltar ao lobby / tentar novamente).

### E. Acessibilidade

- **D-E01:** todo fluxo é navegável por teclado (Tab em ordem lógica; Enter ativa ações); foco visível em todos os estados (não removido).
- **D-E02:** contraste de texto/UI atende WCAG AA; estados não são comunicados apenas por cor (acompanham texto/ícone).
- **D-E03:** erros e mudanças de estado usam `aria-live` adequado (assertivo p/ erros, polido p/ atualizações de lista); leitores de tela identificam o ambiente com `aria-label`/`role` claros.
- **D-E04:** o widget de copiar identificador tem alternativas (ex.: exibir o ID em texto para leitura) e rótulos completos.

### F. Responsividade desktop

- **D-F01 (brief — metas):** layouts validados a partir de **1280×720** até viewport desktop maiores; layout fluido (colunas/grade simples) sem scroll horizontal e sem elementos sobrepostos.
- **D-F02 (brief):** linkado a Chrome e Firefox desktop como referência; o design não depende de dimensões fixas rígidas nem de interação exclusiva de mouse.

---

## Wireframes textuais

### 1) Tela inicial — entrada de apelido (estados: vazio/carregando/erro)

```
┌──────────────────────────────────────────────────────────────┐
│  TRUCO PAULISTA — lobby                         [logo/marca] │
│                                                              │
│   [Campo Apelido   (1–20 caracteres)_______________]  [[Criar sala]]  >
│                                                              │
│   ou escolha uma sala disponível abaixo:                     │
│   ┌────────────────────────────────────────────────────────┐ │
│   │ Sala  •  criador: Amane       • aguardando 2º  [Entrar] │ │
│   │ Sala  •  criador: Amane(2)    • aguardando 2º  [Entrar] │ │
│   │ (lista atualiza automaticamente, sem recarregar)        │ │
│   └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

- **vazio:** campo neutro, botão "Criar sala" desabilitado.
- **inválido/erro (texto puro):** sob o campo, "Informe um apelido entre 1 e 20 caracteres". Nada é executado a partir da entrada.
- **carregando:** ao submeter, indicador de progresso no botão (`aria-busy`).
- Legenda de acessibilidade: campo com `aria-label="Apelido"` e `aria-describedby` do erro.

### 2) Espera — "aguardando 2º jogador" (criador)

```
┌──────────────────────────────────────────────────────────────┐
│  Sala aberta                                    [Sair da sala] │
│                                                              │
│   Identificador:  TRUCO-7F3A        [copiar]                 │
│                                                              │
│   ●  Amane  (você, criador)  — aguardando 2º jogador        │
│   ○  (aguardando...)                                        │
│                                                              │
│   A lista pública atualiza sem recarregar.                   │
└──────────────────────────────────────────────────────────────┘
```

### 3) Sala completa — ambos os participantes

```
┌──────────────────────────────────────────────────────────────┐
│  Sala completa      ID: TRUCO-7F3A          [Sair da sala]   │
│                                                              │
│   ●  Amane          ●  Bruno                                  │
│                                                              │
│   Dois jogadores prontos.  A partida começa em seguida.      │
│   (transição pré-jogo — ainda não é a partida em 3D)         │
└──────────────────────────────────────────────────────────────┘
```

- Este é o **limite da fatia de lobby**. Não há botão de jogo simulado nem 3D nesta etapa.

### 4) Lista de salas — sessão independente (LOB-02)

```
┌──────────────────────────────────────────────────────────────┐
│  Salas aguardando o 2º jogador      (atualização automática) │
│   • TRUCO-7F3A — Amane                [Entrar]               │
│   • TRUCO-9C11 — Duda                 [Entrar]               │
│  Sala cheia não aparece nesta lista.                        │
│  [Atualizar manualmente não substitui a atualização autom.] │
└──────────────────────────────────────────────────────────────┘
```

### 5) Desconexão / sala removida (LOB-06)

```
┌──────────────────────────────────────────────────────────────┐
│  Conexão perdida        — reconectando...                    │
│  [Tentar novamente]     [Voltar ao lobby]                    │
│                                                              │
│  Sala não encontrada / removida — [Voltar ao lobby]          │
└──────────────────────────────────────────────────────────────┘
```

- Nunca há indicação de "aguardando 2º" em sala que não existe mais (política de limpeza/timeout do CTO).

---

## Mapeamento LOB → Design

| LOB | Aceite | Referência de design |
|---|---|---|
| LOB-01 | Apelido + criar sala, ID e espera visíveis | D-A01/03, D-B01, wireframe 1 e 2 |
| LOB-02 | B vê a sala sem recarregar | D-B02/03, wireframe 4 |
| LOB-03 | B entra; ambos veem completa | D-C01, wireframe 3 |
| LOB-04 | Terceiro rejeitado; última vaga | D-C02/03 |
| LOB-05 | Apelido vazio/faixa/exibição segura | D-A01/02 |
| LOB-06 | Desconexão sem sala falsa | D-D01/02, wireframe 5 |
| LOB-07 | Regressão/revisão/CI/QA dois browsers | cobertura dos wireframes/estados nos dois browsers (QA) |
| V01-08 | Estados claros, reconexão/encerramento | D-A04, D-D01, seção Estados |

---

## Riscos e pendências

- **Dependências técnicas (não decididas aqui):** identidade técnica e timeout de desconexão (LOB-06), e o meio de atualização em tempo real (LOB-02/03) são decisões do CTO/Tech Lead. O design especifica o **comportamento de UX esperado** e depende delas para validação.
- **Transição pré-jogo é marco, não partida:** a passagem de "sala completa" para o jogo não é implementada nesta etapa; o design registra o estado, mas a renderização 3D e as regras ficam para as fases seguintes (evita prometer jogo entregue).
- **Relação com perguntas de regra (V01-05):** as dúvidas de regras do Truco Paulista (manilhas, empates, escalada, mão de onze, abandono em partida) não são tratadas neste documento de lobby e permanecem como pré-requisito do Produto antes de V01-05.
- **Acessibilidade a validar em revisão visual independente:** contraste, foco e leitores de tela exigem capturas e teste em dois navegadores (QA), conforme o brief; o design define os critérios, não executa a homologação.
- **Nenhum agente revisa o próprio trabalho:** este documento deve ser revisado de forma independente (Produto) antes de qualquer uso na implementação.