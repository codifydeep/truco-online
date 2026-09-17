# Truco Online v0.1 — Product Brief para aprovação

Identificador: BRIEF-TRUCO-v0.1-R1-20260916
Estado: AGUARDANDO_APROVACAO_DO_CEO
Este documento não reaproveita aprovações anteriores. Aprovar este brief não
aprova arquitetura, PR, exceção de segurança nem homologação.

## Objetivo

Entregar um jogo de Truco Paulista para exatamente dois jogadores humanos,
exclusivamente no navegador, bonito, responsivo e rápido, acessível em ambiente
Docker local de homologação. Uma pessoa deve conseguir testar os dois lados
usando browsers diferentes ou janela anônima, com sessões independentes.

O visitante informa um apelido, sem cadastro ou autenticação. Pode criar uma
sala ou entrar em uma sala pública que aguarda o segundo jogador. Quando os
dois estiverem prontos, a partida acontece em ambiente 3D com mesa, cartas,
representação dos jogadores, braços e mãos. As telas anteriores podem ser 2D.
Three.js é uma opção, não uma exigência: a decisão técnica pertence ao CTO.

## Escopo e limites

- v0.1: web, dois jogadores, partidas completas de Truco Paulista e experiência 3D.
- Fora do escopo: aplicativo mobile, bots adversários, quatro jogadores, ranking,
  chat, pagamentos, login, publicação em lojas e infraestrutura cloud da aplicação.
- Aplicação, banco, CI e homologação em Docker local, sem serviços pagos.
- Inferência dos agentes: deepseek/deepseek-v4-flash-0731 via OpenRouter,
  autorizada pelo CEO. Não habilitar fallback automaticamente. Não enviar
  credenciais ou dados pessoais reais ao modelo. Essa autorização não libera
  serviços cloud para o jogo nem outras despesas.
- Nove perfis, no máximo dois workers simultâneos e um por perfil.
- CTO/Tech Lead resolvem arquitetura e problemas técnicos. CEO responde
  questões de experiência, regras desejadas, escopo e exceções explicitadas.

## Critérios de aceite da versão completa

| ID | Evidência exigida |
|---|---|
| V01-01 | Apelido sem autenticação; duas sessões independentes em browsers distintos/anônimo. |
| V01-02 | Criar sala e listar salas aguardando segundo jogador, com atualização sem recarregar a página. |
| V01-03 | Entrar em sala disponível; capacidade de dois aplicada no servidor, inclusive sob entradas concorrentes. Sala cheia deixa a lista de disponíveis. |
| V01-04 | Dois jogadores prontos iniciam uma partida; ações fora de turno ou inválidas são rejeitadas pelo servidor. |
| V01-05 | Partida completa, pontuação, pedidos/respostas de truco e condições de vitória segundo um contrato explícito de Truco Paulista. |
| V01-06 | Cartas privadas não são expostas ao adversário nem em mensagens da API; cliente não determina distribuição, placar ou resultado. |
| V01-07 | Mesa, cartas, jogadores, braços e mãos em 3D durante a partida, sem impedir a leitura das cartas ou as ações. |
| V01-08 | Estados de espera, erro, desconexão e fim de partida claros; reconexão ou encerramento seguem política documentada e testada. |
| V01-09 | Fluxos completos e regressões passam em dois navegadores; revisão independente, CI e QA pós-deploy referenciam o mesmo commit. |
| V01-10 | URL local acessível, serviços saudáveis, logs, procedimento de acesso e rollback comprovado. Relatório cobre todos os critérios, não apenas o lobby. |

### Qualidade visual e desempenho: metas propostas

Designer apresenta um estilo consistente, com cartas legíveis, hierarquia clara,
estados de foco e ações compreensíveis. A revisão visual registra capturas do
lobby e da partida, sem declarar qualidade apenas pelo texto do agente.

Proposta de referência: Chrome e Firefox desktop, viewport a partir de 1280×720.
Interações do lobby devem refletir no segundo browser em até 1 segundo no
percentil 95 em 30 operações no host de homologação. Partida 3D deve manter
pelo menos 30 FPS médios durante 60 segundos de jogo nesse host. QA registra
hardware, browsers, carga concorrente e método de medição. São metas a validar,
não resultados já obtidos; CTO escolhe a implementação para alcançá-las.

## Primeira fatia: lobby funcional com dois navegadores

Objetivo: comprovar uma integração real entre interface web, servidor e estado
compartilhado antes de desenvolver regras completas e renderização 3D.

| ID | Aceite da fatia |
|---|---|
| LOB-01 | Browser A informa apelido e cria uma sala; identificador e estado de espera ficam visíveis. |
| LOB-02 | Browser B tem sessão independente e vê a sala de A sem recarregar a página. |
| LOB-03 | B entra; ambos veem os dois participantes e o estado “sala completa”. |
| LOB-04 | Um terceiro cliente não entra na sala completa; teste automatizado também cobre duas tentativas concorrentes pela última vaga. |
| LOB-05 | Apelido vazio é rejeitado; texto é exibido sem execução de HTML/script. Proposta: 1–20 caracteres após remoção de espaços nas extremidades; apelidos iguais são permitidos, pois não identificam a sessão. |
| LOB-06 | Abandono ou queda não mantém uma sala falsa disponível indefinidamente. CTO define timeout/identidade técnica; produto documenta a experiência de espera/saída. |
| LOB-07 | Testes Red-Green, regressão, revisão independente, CI e QA em dois browsers estão registrados; Compose local saudável, URL e rollback comprovados. |

Nesta fatia, “sala completa” NÃO significa partida implementada. Não criar um
botão que simule jogo entregue. O resultado é um marco intermediário; a v0.1
permanece ATIVA e não recebe HOMOLOGADA apenas por concluir o lobby.

## Decisões funcionais posteriores, sem bloquear o lobby

Antes de implementar V01-05, Produto apresenta um contrato de regras de Truco
Paulista para dois jogadores, explicitando manilhas, empates, escalada do truco,
mão de onze/ferro e abandono. O CEO confirma somente ambiguidades ou variantes
de experiência; decisões de implementação ficam com CTO/Tech Lead. Nenhuma
variante será inventada silenciosamente. As dúvidas não exigem repetir a
entrevista original nem impedem o início da fatia de lobby aprovada.

## Organização e gates

1. CEO aprova esta versão do brief, identificada por ID/hash.
2. Produto registra histórias/aceites; Designer define fluxo; CTO registra ADR.
3. Tech Lead cria o grafo revisado, com responsáveis e revisores independentes.
4. Backend e Frontend implementam a fatia com TDD; DevOps e QA entregam
   implantação, validação e evidências. Mobile fica sem implementação na v0.1.
5. O time continua com regras, privacidade e 3D até cumprir a versão completa.

Nenhum agente revisa seu próprio trabalho. Testes existentes não podem ser
apagados, ignorados ou enfraquecidos para tornar um PR verde. Produto integra
em release/v0.1; main só recebe fundação/governança por PR revisado.
Telegram comunica; GitHub, Kanban e recibos duráveis comprovam o trabalho.

## Pré-condições operacionais antes da implementação

- Vincular o recibo aprovado do ensaio deepseek ds1 à liberação técnica.
- Atualizar o contrato instalado que ainda exige Qwen e conferir divergências.
- Trocar o escopo dos gateways/supervisor do ensaio para o board de produto,
  preservando snapshots e resultados anteriores.
- Registrar aprovação deste brief e configurar os gates próprios do produto:
  as ferramentas fechadas da fixture HTTP não bastam para desenvolver o jogo.
- Validar despacho, worktrees, GitHub, revisão e limites sem liberar cards
  de implementação antes da aprovação registrada.

Essas pré-condições não estão declaradas concluídas por este documento.

## Aprovação

Para aprovar: “Aprovo BRIEF-TRUCO-v0.1-R1-20260916, incluindo a primeira fatia
de lobby e as metas propostas.” Mudanças solicitadas geram nova revisão e hash.
