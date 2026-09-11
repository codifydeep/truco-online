# Ciclo de vida de uma release

## Dois níveis de estado

O Hermes Kanban mantém os estados nativos dos cards (`triage`, `todo`, `ready`, `running`, `review`, `blocked`, `done` e `archived`). O estado da release é um campo lógico registrado nos metadados e comentários do card controlador `RELEASE-vX.Y`; ele não cria colunas personalizadas no Kanban.

Estados lógicos permitidos:

1. `EM_DESCOBERTA`
2. `AGUARDANDO_APROVACAO_DO_BRIEF`
3. `ATIVA`
4. `BLOQUEADA_AGUARDANDO_CEO`
5. `EM_HOMOLOGACAO`
6. `HOMOLOGADA`
7. `CANCELADA_PELO_CEO`

## Fluxo obrigatório

1. O CEO inicia com `[VERSAO:vX.Y]`.
2. Produto entrevista o CEO, registra o Product Brief e solicita uma aprovação explícita.
3. Depois da aprovação, o Tech Lead cria `release/vX.Y`, o card controlador e seu grafo de filhos.
4. Produto, Design e CTO produzem critérios de aceite, fluxos e ADRs.
5. Implementações seguem em paralelo quando as dependências permitirem.
6. Cada mudança passa por PR, CI e revisão independente no mesmo card: o implementador usa `request-review`; o revisor usa `request-changes` para devolver ao autor ou conclui o card ao aprovar.
7. QA/SecOps executa validação integrada antes e depois do deploy.
8. DevOps publica a release em Docker local.
9. O Tech Lead registra URL, commit, PRs, testes e evidências. APK/Expo são exigidos somente quando o brief aprovado inclui mobile; v0.1 é exclusivamente navegador.
10. O controlador só recebe `HOMOLOGADA` com todos os critérios de saída comprovados.

## Persistência e falhas

- O card controlador permanece vivo enquanto houver filhos pendentes.
- O controlador não deve ser ligado como pré-requisito pai de cards executáveis: no Hermes, o filho só é liberado quando o pai termina, enquanto o controlador deve permanecer aberto até a homologação. Registre a associação dos cards nos comentários/metadados do controlador e use links somente entre dependências executáveis.
- Uma execução sem sucesso pode ser tentada duas vezes automaticamente. O supervisor acompanha impedimentos em um único `INCIDENT-<card>` idempotente, fora do DAG bloqueado. Especialistas escalam ao Tech Lead, e este ao CTO. Não crie gerações sucessivas de RECOVERY/PLAN. Recorrência reabre o mesmo incidente.
- O bloqueio de um card não conclui nem cancela a release.
- Não existir card imediatamente executável não autoriza declarar sucesso.
- Só o CEO pode cancelar uma release.

## Evidência antes de progresso

- Um artefato só existe quando estiver presente no worktree, versionado em commit e referenciado por PR contra a branch da release.
- Uma descrição textual de conteúdo não comprova que o arquivo foi criado.
- O Tech Lead deve validar caminho, SHA, PR e CI antes de aceitar a conclusão e liberar dependentes.

## Watchdog de progresso

Quando o mesmo impasse reaparecer sem nova evidência, o Tech Lead cria um `SPIKE`. O card deve registrar:

- pergunta ou decisão a resolver;
- hipóteses concorrentes;
- experimento local executável;
- responsável;
- evidência esperada;
- critério de escolha.

O resultado deve ser anexado ao card ou persistido no repositório. Experimento técnico inconclusivo permanece sob responsabilidade do CTO, que reduz a hipótese ou envolve um especialista. Somente dependência de produto/escopo, credencial, autorização ou exceção explícita de risco permite `BLOQUEADA_AGUARDANDO_CEO`. Timeout não é dependência humana. A resposta reativa o mesmo grafo.

## Critérios de saída de homologação

- Branch `release/vX.Y` identificada por commit imutável.
- CI completa verde.
- Ambiente local iniciado a partir desse commit.
- Health checks aprovados.
- Testes E2E e de regressão aprovados no ambiente implantado.
- Verificações de segurança aprovadas ou riscos explicitamente aceitos pelo CEO.
- URL web/API, APK Android e instruções Expo Go entregues quando aplicáveis.
- Evidências e limitações registradas no relatório da release.

## Gate verificável e retomada

O registro operacional `/opt/data/governance/active-release.json` identifica branch, controlador, repositório e plataformas. Não abrir uma segunda release ativa. A atualização desse registro é operação de governança pelo Tech Lead/operador, nunca inferência por título de mensagem.

Antes de concluir o controlador, integrar `docs/releases/vX.Y/homologation.json` por PR. O relatório contém: `state=HOMOLOGADA`, `commit` e `deployed_commit` (SHA de 40 caracteres iguais), `brief_approval.evidence`, `acceptance` (lista de `criterion` e `cards`), `qa` e `deployment` (cada um com `profile`, `card`, `commit`, `evidence`), `platforms`, `url`, `rollback`, `limitations` e `services` (nomes exatos dos containers).

O gate rejeita cards obrigatórios pendentes, falta de evidência, SHA não integrado, CI do SHA sem sucesso e containers sem saúde/labels de projeto e revisão. DevOps define `org.opencontainers.image.revision` em cada serviço de homologação. QA continua responsável por executar a validação pós-deploy e anexar logs; preencher um JSON não comprova testes por si só.

Resposta humana no dashboard retoma o diagnóstico do incidente uma vez por comentário, sem autorizar ferramenta nem desbloquear automaticamente o card original. Telegram deve registrar a resposta e seu escopo no incidente; nunca interpretar palavra solta como autorização geral. O responsável verifica pré-condições e usa a transição nativa adequada. Heartbeat após retomada é monitoramento, não resolução.

O dispatcher só é habilitado no gateway techlead; demais gateways continuam disponíveis para conversa. Arquivo `MAINTENANCE` ao lado do banco impede ticks de despacho após restart. Durante manutenção, observer e despacho ficam suspensos e worktrees preservados.
