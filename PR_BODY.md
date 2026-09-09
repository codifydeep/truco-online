Corrigir regras e backlog do Truco Paulista v0.1 apos revisao

## O que foi entregue
- regras do Truco Paulista (v0.1): separacao clara entre regras confirmadas de Paulista (manilha rotativa, pontuacao 1/3/6/9/12 por mao) e elementos fora do escopo ou variantes regionais (como dealer, mao de ferro, empates). Todas as fontes citadas sao publicas e acessiveis online.
- backlog v0.1: historias organizadas por epic alinhadas aos criterios observaveis do Product Brief aprovado: lobby 2D com transicao automatica ao ambiente 3D, entrada sem autentificacao, privacidade das cartas, manilha rotativa definida pelo vira e encerramento pela condicao de primeiro a atingir o limiar de pontos.

## O que corrigi explicitamente
- Apelido e fluxo conforme a pagina inicial do brief: criacao/listagem de salas sem cadastro, lista com ate dois participantes (sem inventar um jogador 1 fixo), entrada automatica para iniciar mao ao completar segundo jogador.
- Privacidade das cartas mantida durante a mao, reveladas apenas por rodada — criterio explicito do brief sobre nao vazamento de informacao.
- Criterios observaveis e nao prescricao implementacao tecnica (nao escolhi Three.js/Socket.io; o CTO decidira stack e transporte real-time).

## Evidencias de entrega no repositorio
Commit SHA: 6b585d3 (feito) na feature branch feat/t_459589dc-product-r2-corrigir-regras-e-backlo.  

O Tech Lead pode inspecionar os documentos no caminho /docs/product/ da worktree e revisar o backlog estruturado por epic + historias com criterios observaveis antes de decompor em tarefas tecnicas.