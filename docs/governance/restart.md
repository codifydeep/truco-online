# Recomeço e liberação da equipe

## Histórico

A tentativa anterior foi CANCELADA_PELO_CEO para recomeço rastreável, não
HOMOLOGADA. Nenhum card, incidente, cron ou memória anterior é obrigação da
nova execução. O Git não teve seu histórico reescrito.

## Barreiras de liberação

O estado `/opt/data/governance/execution.json` identifica tentativa, board e
liberação. O produto permanece parado enquanto `rehearsal_passed=false` ou
`product_dispatch_enabled=false`. Remover um arquivo MAINTENANCE isoladamente
não constitui aprovação técnica do ensaio.

Antes de liberar, registrar evidências de implementação TDD, mudanças
solicitadas em PR, revisão independente, CI local, merge, deploy, QA e
recuperação de falha. Também testar eventos duplicados/antigos, reinícios,
falha de notificação e rejeição de evidências incompletas.

## Limites de confiança

A conta GitHub compartilhada distingue perfis por registro operacional, não
por isolamento criptográfico. Os agentes não estão protegidos entre si como
atores adversariais. Prosa, heartbeat e JSON preenchido não provam execução.

Notificações usam entrega com repetição em caso de falha. Uma resposta perdida
do Telegram pode causar repetição visível; identificadores permitem reconhecê-la.
Nunca alegar exatamente uma entrega se o transporte não a garante.
