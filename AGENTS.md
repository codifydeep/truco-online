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

