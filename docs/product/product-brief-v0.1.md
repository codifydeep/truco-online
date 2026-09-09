# Product Brief — Truco Online v0.1

Status: aprovado pelo CEO em 8 de setembro de 2026.

## Objetivo

Entregar a primeira versão jogável do Truco Online exclusivamente para navegador, executada em infraestrutura local e acessível por uma URL de homologação. Duas pessoas devem conseguir jogar uma partida de Truco Paulista; para teste, uma única pessoa pode representar os dois jogadores usando navegadores ou sessões independentes.

## Experiência principal

1. O jogador abre a URL local e informa apenas um apelido, sem cadastro ou autenticação.
2. Na página inicial, pode criar um jogo ou escolher um dos jogos que aguardam um segundo jogador.
3. Jogos criados e ainda disponíveis aparecem em uma lista atualizada para os demais visitantes.
4. Cada jogo aceita exatamente dois jogadores nesta versão.
5. Antes do início da partida, lobby, lista e transição podem usar uma interface 2D.
6. Quando o jogo começa, ambos entram em um ambiente 3D que representa mesa, jogadores, cartas, braços e mãos de maneira coerente com os pontos de vista dos participantes.
7. A partida segue a variante Truco Paulista, mantém o estado sincronizado e apresenta claramente turnos, cartas, pedidos de truco, placar e resultado.

## Qualidades esperadas

- Aparência bonita e consistente.
- Interações rápidas em execução local.
- Ambiente 3D responsivo, com degradação visual razoável em máquinas sem GPU dedicada.
- Estado da partida autoritativo e idêntico nas duas sessões.
- Inicialização reproduzível por Docker Compose local.

O CTO tem liberdade para escolher Three.js ou outra solução open source compatível, justificando a decisão em ADR. O Tech Lead e o CTO devem transformar “bonito e rápido” em critérios técnicos mensuráveis antes da implementação final.

## Critérios de aceite funcionais

- A aplicação abre por uma URL local documentada.
- Duas sessões independentes conseguem informar apelidos diferentes.
- Uma sessão cria uma sala; a outra a enxerga e entra nela.
- Uma sala ocupada não aceita um terceiro jogador e apresenta feedback compreensível.
- A entrada do segundo jogador inicia o fluxo da partida sem autenticação.
- A partida completa de Truco Paulista pode ser jogada até o resultado final.
- Informações privadas, especialmente as cartas de cada jogador, não vazam para a interface do oponente.
- Ações, turnos, placar e encerramento permanecem sincronizados nas duas sessões.
- O ambiente 3D só é obrigatório a partir do início da partida.
- Testes automatizados cobrem regras, sincronização, lobby, jornada E2E e regressões.
- A versão é publicada e validada no ambiente Docker local de homologação.

## Fora do escopo da v0.1

- Aplicativos mobile.
- Autenticação, contas permanentes ou recuperação de acesso.
- Partidas com quatro jogadores.
- Cloud, serviços pagos, lojas de aplicativos ou publicação externa.
- Ranking, pagamentos, monetização, chat social e matchmaking automático.

## Decisões internas não bloqueantes para o CEO

- CTO: stack web/3D, transporte de tempo real, autoridade do estado e orçamento de desempenho.
- Designer: fluxos e linguagem visual do lobby e do ambiente 3D.
- Tech Lead: decomposição, dependências, paralelização e ordem de implementação.
- QA/SecOps: estratégia de testes, segurança e evidências de homologação.

Essas decisões devem ser persistidas em ADRs, documentos de design ou cards. Elas não exigem nova aprovação do CEO enquanto não alterarem o objetivo, o escopo ou o contrato de testes.
