# Matriz de revisão

| Autor ou tipo de artefato | Revisor obrigatório |
|---|---|
| Produto e UX Research | `techlead` |
| Design UX/UI | `produto` |
| Arquitetura e ADR | `techlead` |
| Backend, dados, frontend e mobile | `techlead` |
| Mudança produzida por `techlead` | `cto` |
| DevOps e homologação | `quality_security` |
| QA e SecOps | `techlead` |

Uma única conta GitHub será compartilhada na PoC. A autoria e a independência da revisão devem ser registradas no comentário do PR e no evento do Kanban com o nome do perfil Hermes. A mesma identidade GitHub não autoriza auto-revisão lógica.

A matriz é validada no `request_review` nativo do Hermes, incluindo CLI e ferramentas. Novo SHA exige nova inspeção do diff e dos checks. O revisor devolve alterações ao autor com `request-changes`, não corrige o PR que está revisando.

GitHub exige PR, checks `governance` e `hermes-independent-review` verdes com base atualizada, conversas resolvidas e proíbe force-push/deleção da release, inclusive para administradores. O check independente é publicado por `review_merge.py` após validar o run revisor, a matriz e o SHA exato. Como todos usam a mesma conta, o número de aprovações GitHub é zero: isso NÃO significa dispensa da revisão lógica no Kanban. Não existe isolamento de identidade contra um agente adversarial com acesso root/token de administrador; separar identidades e credenciais seria necessário para essa garantia.
