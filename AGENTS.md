# Contrato de trabalho dos agentes

Estas regras valem para todo o repositório.

## Fonte de verdade e escopo

1. Repositório e ADRs prevalecem sobre o Kanban; Kanban prevalece sobre o chat; memória individual nunca prevalece sobre artefatos persistidos.
2. Trabalhe apenas no card atribuído e nos arquivos necessários aos critérios de aceite.
3. Não use serviços pagos ou cloud. A infraestrutura desta PoC é Docker local.
4. Não coloque tokens, senhas, credenciais, dados pessoais ou segredos em commits, PRs, cards ou Telegram.

## Git e revisão

1. `main` permanece estável durante a release.
2. A integração ocorre em `release/vX.Y`.
3. Use `feat/<kanban-id>-<slug>` para implementação.
4. Abra PR contra a release ativa e inclua evidências Red, Green e da suíte completa.
5. Nenhum perfil revisa o próprio trabalho.
6. Não faça merge sem CI verde e aprovação do revisor indicado em `docs/governance/review-matrix.md`.
7. Depois de abrir e verificar o PR, o implementador usa a transição nativa `request-review` no mesmo card e informa o perfil revisor; não conclui o card antes da revisão.
8. O revisor conclui o mesmo card quando aprova ou usa `request-changes` com motivos concretos, o que o devolve ao implementador original. Não crie um card de revisão separado para novos trabalhos.
9. Como a PoC usa uma única conta GitHub, registre o perfil Hermes e o veredito em comentário no PR e no evento de revisão do Kanban; não tente adicionar usernames do Telegram como reviewers do GitHub.

## TDD e regressão

1. Comece por um teste que falha pelo motivo esperado.
2. Faça a menor implementação que o torne verde e só então refatore.
3. Nunca apague, pule, renomeie ou enfraqueça testes preexistentes para aceitar uma mudança.
4. Mudança intencional de contrato exige card próprio e aprovação explícita do CEO.
5. Se um teste antigo falhar, corrija a regressão ou demonstre o conflito de contrato; não altere silenciosamente o teste.

## Continuidade da release

1. Não há limite de handoffs ou mensagens.
2. Encerrar uma resposta ou execução individual não encerra a release.
3. Falhas técnicas voltam para diagnóstico, divisão ou reatribuição.
4. Impasse repetido sem evidência vira um card `SPIKE` com hipótese, experimento e critério objetivo.
5. Dependência exclusivamente humana usa `BLOQUEADA_AGUARDANDO_CEO` e retoma do mesmo estado.
6. Somente `HOMOLOGADA` é conclusão bem-sucedida; cancelamento exige ordem explícita do CEO.

## Colaboração no Telegram

1. Antes de um handoff, leia `.hermes/team/telegram-roster.yaml` e mencione o username real do próximo responsável.
2. Inclua no handoff o ID do card, artefato ou evidência produzida, dependências e a ação objetiva esperada.
3. Mencione apenas o próximo responsável por padrão; mencione vários bots somente quando os cards puderem avançar realmente em paralelo.
4. Não envie confirmação ou promessa sem executar trabalho, registrar decisão, atualizar o Kanban ou formular uma pergunta objetiva.
5. Escrever o nome de um papel, como “CTO”, sem o username Telegram não aciona esse perfil; use sempre a menção registrada no roster.
6. Depois da aprovação do Product Brief, não peça ao CEO para escolher agente, ordem de implementação, stack ou paralelização. Essas decisões pertencem ao Tech Lead e ao CTO.

## Identificadores canônicos dos perfis

Use somente estes identificadores em `assignee`, `reassign`, automações e metadados do Kanban:

- `produto`
- `designer`
- `cto`
- `techlead`
- `backend_data`
- `frontend`
- `mobile`
- `devops`
- `quality_security`

Não traduza nem invente aliases como `product`, `product-designer`, `tech-lead`, `developer` ou `qa-tester`. Antes de criar ou reatribuir cards, valide o identificador no roster e em `hermes kanban assignees`. Um responsável que não exista em disco torna o card não executável.

## Evidência mínima de entrega

1. Não afirme que um arquivo foi salvo, um teste foi executado, um commit foi criado ou um PR foi aberto sem comprovar isso com ferramentas no worktree do card.
2. Antes de solicitar revisão, verifique a existência dos arquivos, adicione-os ao índice, execute `git diff --cached --check`, faça commit, execute `git show --check --oneline HEAD`, confirme que `git status --porcelain` está vazio e registre o SHA e a URL do PR contra `release/vX.Y`.
3. Comentário no Kanban ou mensagem no Telegram não substitui arquivo, commit, PR ou saída de teste.
4. Se uma ferramenta indispensável não estiver disponível, bloqueie o card com diagnóstico objetivo. Nunca simule a entrega em texto.
5. Revisores devem inspecionar o PR, o commit e os arquivos reais. Se qualquer evidência estiver ausente, solicite mudanças ou crie uma recuperação; não aceite a narrativa do implementador como prova.
