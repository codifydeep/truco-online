# Lifecycle de releases e tentativas

A versão comercial e a tentativa de execução são identidades diferentes.
Uma tentativa cancelada nunca transfere aprovações, cards ou evidências para
outra tentativa. Uma única release de produto pode estar ativa.

## Estados persistentes

EM_DESCOBERTA → AGUARDANDO_APROVACAO_DO_BRIEF → ATIVA → EM_HOMOLOGACAO → HOMOLOGADA.

ATIVA e EM_HOMOLOGACAO podem entrar em BLOQUEADA_AGUARDANDO_CEO somente por
dependência humana identificada. CANCELADA_PELO_CEO requer decisão explícita.
Não existe conclusão por número de mensagens, timeout, ausência de cards ready
ou fim de uma execução individual.

O ledger operacional registra transições com estado anterior esperado,
responsável e evidência. Comentários e Telegram explicam o estado, não o
substituem. O controlador RELEASE não é pai bloqueante de cards executáveis.

## Brief e decomposição

Produto reaproveita o objetivo informado, esclarece apenas dúvidas relevantes
e apresenta critérios identificados. CEO aprova uma versão imutável do brief.
CTO decide arquitetura; Tech Lead registra o plano e o grafo acíclico.

Cada card terá responsável, critérios de aceite, dependências reais, revisor,
workspace, prazo e evidências esperadas. Documentação não deve receber um ciclo
Red artificial. Implementação e correção de código seguem TDD.

## Entrega e recuperação

Implementador faz commit e push, verifica o SHA do PR e solicita revisão no
mesmo card. Revisor devolve mudanças ao autor ou integra após CI e análise.
Um novo SHA invalida a revisão anterior. Main recebe somente fundação/governança
autorizada; mudanças de produto seguem para release/vX.Y.

Cada ocorrência de falha gera incidente identificado fora do DAG bloqueado.
Especialistas escalam ao Tech Lead; este ao CTO. Dez minutos sem progresso
exigem alerta e trinta exigem escalonamento/experimento. Duas tentativas iguais
sem nova evidência não autorizam repetição infinita.

O supervisor pode criar um SPIKE real. Seu resultado inclui hipótese, critério,
comandos, saídas e decisão. CTO aplica a decisão por replanejamento ou devolução
ao implementador. Experimento concluído, card ready e heartbeat não encerram
o incidente. A condição original precisa ser verificada.

## Homologação

Todos os critérios da baseline aprovada devem estar cobertos por cards
concluídos e evidências. O relatório não pode omitir critérios para passar.
QA e DevOps devem comprovar testes e implantação do mesmo commit, incluindo
saúde dos serviços, URL acessível, limitações e rollback.

Na v0.1, plataformas=[web]. APK e Expo Go não são requisitos desta release.
Recibos duráveis preservam evidências após limpeza de worktrees e branches.
Somente o Tech Lead anuncia HOMOLOGADA depois dos gates técnicos aprovados.

## Recomeço atual

O produto está bloqueado em ESTABILIZACAO. Não iniciar o fluxo acima enquanto
o ensaio isolado de entrega e recuperação não estiver aprovado. Consulte
docs/governance/restart.md; nenhuma checklist textual substitui essa prova.
