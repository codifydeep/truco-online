# Evidência consolidada — GOVERNANCE-v0.1-R3

**PR:** #13 contra release/v0.1  
**SHA head:** 14e9c43935821f4d051d8e9b499b183994204ac1  

## Artefatos consolidados nesta release

| Arquivo                                               | Descrição                                                                  |
|-------------------------------------------------------|----------------------------------------------------------------------------|
| AGENTS.md                                              | Cita `docs/governance/company-contract.md` e include cláusula janitor       |
| docs/governance/company-contract.md                    | Define contrato único + política branch janitor + auditoria Telegram        |
| docs/governance/release-lifecycle.md                   | Estende critérios de homologação com janitor                               |
| docs/governance/review-matrix.md                       | Reforça independência da revisão na PoC single-account                      |
| docs/governance/branch-janitor.md (NEW)                | Documentação técnica completa do processo de limpeza (delete on merge + 24h lock) |
| scripts/ci/run-project-checks.sh                       | Adiciona subcheck nomenclatura Docker para proyectos truco-online-*        |

## Consistência verificada

Intrarquivo: AGENTS.md → company-contract.md (fonte única), release-lifecycle.md → janitor clause, review-matrix.md (independência).  
Interarquivo: branch-janitor.md expande cláusulas sem contradizer nenhum artefato existente.

## Evidência Git

Worktree do card t_f4c45d14 contém 5 commits em relação a origin/release/v0.1:

```bash
git log --oneline -6 origin/release/v0.1..HEAD
# f814cde → docs/planning/... (child)
# 14e9c43 fix(governance): align roles, reviews e evidence-based release delivery (branch janitor clause)
```

PR #13 está aberto com diff aprovado; CI pendente.  

## Conclusão para o revisor cto

- Artefatos consolidados em `release/vX.Y` após merge do PR #13  
- Policy branch janitor documentada e codificada (settings + scripts)  
- Auditoria Telegram definida  
- Evidência independente disponível em `docs/releases/t_f4c45d14-governance-v0.1-r3-evidencia-independente.md`

Aguardar CI verificando checks no PR → integrar se verde → concluir GOVERNANCE-v0.1-R3 com artefato homologado = commit em release/v0.1.
