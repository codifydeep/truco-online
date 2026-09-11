# branch janitor — política e auditabilidade

## Objetivo

Garantir que branches de feature/cards sejam removidas automaticamente após integração, preservando auditoria:  
- deletar `origin/<branch>` no GitHub após merge;  
- manter worktree local apenas se ainda houver execução ativa ou PR aberto;  
- carência de 24h (com lock vazio) para limpeza do worktree local.

## Setting obrigatório

No repositório main:

```json
{
  "delete_branch_on_merge": true
}
```

## Fluxo obrigatório

1. Merge ocorre contra `release/vX.Y` ou `main`.  
2. Repositório remove a branch remota imediatamente.  
3. Worktree local sobrevive se `.hermes/janitor.lock` existir com PID de worker e tempo expirado < 24h.  
4. Após 24h com lock vazio (arquivo existe mas sem content ou conteúdo hash fixo), worktree é deletado.  

## Condições para exclusão

Worktree local `truco-online/<branch>` é removido quando:

- card pai está `done`/`archived`;  
- nenhum worker está rodando neste worktree (sem heartbeat nos últimos 10min);  
- nenhum PR aberto com `headRefName` igual à branch do worktree;  
- `.hermes/janitor.lock` vazio ou com hash de carência superada (>24h);  
- tip da branch é ancestral de `origin/release/vX.Y` ou `origin/main`.

## Condições para proteção automática

Worktree/signtificativos são preservados mesmo sem lock:

- main (protected, admin only write);  
- release/* (protegido);  
- branches não integradas (mesmo com worktree abandonado — auditoria);  
- worktrees sujos (diff não vazio — sinal de que há edição em andamento).  

O `.hermes/janitor.lock` deve ser criado pelo janitor ao iniciar worker ou quando o card é despachado, e removido quando o worker finaliza com sucesso.

## Auditoria

Auditoria automática do grupo Telegram (dia 17:00 + quando next worker é despachado):

- listar cards sem heartbeat ou não concluídos nos últimos 24h;  
- mencionar `@cto_truco_poc_bot` e listar responsáveis, card, ETA.  

O link `.hermes/team/telegram-roster.yaml` deve ser incluído antes da menção.

## Integração com CI

Script `scripts/ci/check-janitor-config.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
curl -s "$GH_API/repos/$OWNER/$REPO/git/refs/heads/release/v0.1/protection" | jq '.branches[].restrictions.delete' \
  | grep -q true || echo "FAIL: delete_branch_on_merge não é true"
```

`scripts/ci/check-janitor-lock.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
LOCK=~/.hermes/janitor.lock
if [ -f "$LOCK" ]; then
  NOW=$(date +%s)
  EXPIRES=$(($(cat "$LOCK" | tr -d '\n\n' + 0))) # PID+timestamp, simplificado: timestamp de expiracao
  if (( NOW - EXPIRES > 86400 )); then
    echo "WARN: lock de carência superada"
    rm --force "$LOCK"
  fi
fi
```

## Não quebrar

- `release/vX.Y` não é delete;  
- branches não integradas persistem para auditoria;  
- worktrees com diff sujo são protegidos — o janitor apenas avisa, não deleta.
