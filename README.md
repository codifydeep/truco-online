# Truco Online — recomeço controlado

Esta é a base de governança para uma nova execução da v0.1. Ainda não existe
uma versão homologada nem autorização para iniciar implementação de produto.

A tentativa anterior foi encerrada por decisão do CEO em 2026-09-11. Seu
histórico está preservado nos PRs fechados, na tag
`archive/pre-restart-20260911` e em backup privado verificado. Esse histórico
serve para consulta, não como backlog, arquitetura ou aprovação vigentes.

## Ordem de liberação

1. Validar a infraestrutura e os contratos em ensaio isolado.
2. Comprovar entrega ponta a ponta e recuperação automática de uma falha.
3. Produto apresentar o novo brief usando o objetivo do CEO já registrado.
4. CEO aprovar o brief e seus critérios de aceite.
5. CTO e Tech Lead definir arquitetura e grafo de entrega da release.
6. Equipe entregar e validar a v0.1 completa em homologação local.

O identificador da nova tentativa é `truco-restart-20260911`. Seu board é
`truco-online-r2-20260911`. A fase atual é **ESTABILIZACAO**, com despacho de
produto bloqueado. A versão comercial continua sendo `v0.1`.

Leia [o objetivo original](docs/product/ceo-goal-v0.1.md) e
[o contrato de trabalho](AGENTS.md). Não invente uma stack antes do ADR.

## Segurança e custo

Infraestrutura gratuita e local, Docker ARM64, CI em runner próprio e nenhum
fallback pago. Segredos, backups de perfis e conversas privadas nunca entram
no Git. Android e iOS estão fora da v0.1.
