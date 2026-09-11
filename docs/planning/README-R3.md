## Contexto

Este PR carrega o plano de execução vertical v0.1-R3, com exemplos ilustrativos para os cards filhos que serão materializados por `GRAPH-v0.1-R3` após PLAN e GOVERNANCE integrados.

## Artefato principal

docs/planning/v0.1-execution-plan-r3.md (commit f814cde)

- Lista 8 cards filho ilustrativos (CARD-ID-TIPO-SLUG) para backend, frontend, devops e quality_security.
- Cada card terá max_runtime=2h, TDD, revisão independente com reviewer `cto`.
- Filhos ficam em `todo` enquanto GRAPH aguarda evidência de integração dos pais.

## Evidência técnica

- Base: `origin/release/v0.1`
- Head branch local: `truco-online/t_40a09435-plan-v0.1-r3-plano-vertical-fiel-s-fonte`
- SHA commit: `f814cde`
- Arquivo criado no worktree: `/docs/planning/v0.1-execution-plan-r3.md` (9,8KB)

## Depoimentos de não violação



## Próximos passos

Após este PR ser integrado em release/v0.1, o worker `GRAPH-v0.1-R3` deverá:

- Confirmar que PLAN(R3) e GOVERNANCE(R3) estão na base remota.
- Criar exatamente os cards exemplos listados no plano.
- Solicitar review independente para cada card ao perfil `cto`.