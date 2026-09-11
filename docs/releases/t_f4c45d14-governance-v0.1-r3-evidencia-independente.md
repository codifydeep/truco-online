# Evidência independente — GOVERNANCE-v0.1-R3

**PR:** #13 contra release/v0.1  
**SHA head:** 14e9c43935821f4d051d8e9b499b183994204ac1  
**Data:** 2026-09-11T10:??  

## Artefatos modificados

| Arquivo                                               | Mudança                              |
|-------------------------------------------------------|--------------------------------------|
| AGENTS.md                                              | +15/-1. Cita `company-contract.md` e clausejanitor |
| docs/governance/company-contract.md                    | +39/+0. Adiciona section `branch janitor` com delete_on_merge, carencia 24h   |
| docs/governance/release-lifecycle.md                   | +15/-3. Estende criteria de homologação com janitor e auditoria Telegram    |
| docs/governance/review-matrix.md                       | +3/0. Mantém matriz; reforça indep. revisão |
| scripts/ci/run-project-checks.sh                       | +2/-3. Subcheck nomenclatura labels Docker |

## Consistência intrarquivo (verificado)

- AGENTS.md → rules 1-16: compatíveis; clause janitor em rega 16 alinhada a company-contract.md linha 49
- company-contract.md: seção `branch janitor` consistente em todo o texto
- release-lifecycle.md: critérios de saída estendidos sem contradição
- review-matrix.md: matriz estática ok

## CI pendente

Checks a validar no PR #13 (release/v0.1):
1. **governance**: lint, types, markdown syntax
2. **hermes-independent-review**: após run revisor completar tarefa
3. **docker-namecheck**: labels e prefixo `truco-online-` ok

## Próximos passos

- Esperar CI verde no PR #13  
- Request-review ao cto (já em review, aguardando decisão)  
- Integrar em release/v0.1 e concluir GOVERNANCE-v0.1-R3 somente após merge real comprovado
