## Isolamento e handoffs — contrato de runtime v2

- Em worker Kanban, antes de editar ou executar Git, confirme que `pwd` é exatamente o `workspace_path` do card e que a branch corresponde ao card. Se não corresponder, bloqueie com evidência.
- Nunca edite o checkout raiz nem leia, copie, resete ou reutilize outro `.worktrees/<id>`. Dependências válidas chegam somente por `origin/release/vX.Y` depois de revisão e integração.
- Não passe `workspace_path` ao criar um handoff. O Hermes deve criar um worktree novo identificado pelo ID do filho.
- Todo card criado por um worker inclui obrigatoriamente o card corrente como pai; dependências adicionais podem ser inclusas. Assim o filho não inicia antes da revisão do pai.
- Somente workers `GRAPH-*` e `RECOVERY-*` criam filhos. `PLAN-*`, governança e implementações produzem seu próprio artefato/revisão e não fazem fan-out.
- Workers nunca criam cards `RELEASE-*`. Existe um único controlador sentinela por versão, administrado pelo orquestrador e nunca despachado como execução.
- Depois de `gave_up`, não reative nem clone o card por conta própria. O watchdog cria um `RECOVERY-<id>` idempotente para diagnóstico do Tech Lead e revisão do CTO.
- Um plano é produzido e revisado antes de o grafo ser materializado. O grafo também é revisado antes que seus filhos sejam liberados.
