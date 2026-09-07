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
6. Cada mudança de código passa por PR, CI e revisão independente.
7. QA/SecOps executa validação integrada antes e depois do deploy.
8. DevOps publica a release em Docker local.
9. O Tech Lead registra URL, commit, PRs, testes, APK, acesso Expo Go e evidências.
10. O controlador só recebe `HOMOLOGADA` com todos os critérios de saída comprovados.

## Persistência e falhas

- O card controlador permanece vivo enquanto houver filhos pendentes.
- Uma execução sem sucesso pode ser tentada duas vezes automaticamente; depois disso, o Tech Lead diagnostica, divide, corrige pré-condições ou reatribui.
- O bloqueio de um card não conclui nem cancela a release.
- Não existir card imediatamente executável não autoriza declarar sucesso.
- Só o CEO pode cancelar uma release.

## Watchdog de progresso

Quando o mesmo impasse reaparecer sem nova evidência, o Tech Lead cria um `SPIKE`. O card deve registrar:

- pergunta ou decisão a resolver;
- hipóteses concorrentes;
- experimento local executável;
- responsável;
- evidência esperada;
- critério de escolha.

O resultado deve ser anexado ao card ou persistido no repositório. Se nenhuma opção puder ser validada localmente, a release muda para `BLOQUEADA_AGUARDANDO_CEO` e o CEO recebe uma pergunta específica. A resposta reativa o mesmo grafo.

## Critérios de saída de homologação

- Branch `release/vX.Y` identificada por commit imutável.
- CI completa verde.
- Ambiente local iniciado a partir desse commit.
- Health checks aprovados.
- Testes E2E e de regressão aprovados no ambiente implantado.
- Verificações de segurança aprovadas ou riscos explicitamente aceitos pelo CEO.
- URL web/API, APK Android e instruções Expo Go entregues quando aplicáveis.
- Evidências e limitações registradas no relatório da release.

