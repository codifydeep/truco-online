# Política de TDD e integridade da regressão

## Ciclo por card

1. **Red:** crie ou amplie um teste e registre o comando e a falha esperada.
2. **Green:** implemente o mínimo necessário e registre o comando aprovado.
3. **Refactor:** melhore o código sem alterar o comportamento e execute a suíte completa.

O PR deve conter card, critérios de aceite, evidência Red, evidência Green, resultado da suíte completa, riscos e impactos.

## Proteções

É proibido usar uma alteração funcional para:

- excluir ou renomear teste preexistente;
- remover assertion ou tornar a verificação menos específica;
- adicionar `skip`, `xit`, `xdescribe`, `pytest.skip` ou equivalente;
- reduzir descoberta, cobertura ou escopo da suíte;
- alterar configuração para ignorar testes quebrados;
- substituir um teste comportamental por um teste que apenas confirme mocks ou detalhes internos.

O script `scripts/ci/test-integrity-guard.sh` bloqueia mecanicamente os casos observáveis no diff. O revisor continua responsável pela análise semântica.

## Exceção por mudança de contrato

Uma mudança intencional de contrato exige:

1. card separado contendo o comportamento anterior e o novo;
2. impacto nos usuários e compatibilidade;
3. aprovação explícita do CEO registrada no Kanban;
4. alteração da baseline em um PR exclusivo de governança;
5. revisão do CTO e do Tech Lead.

O quality gate não possui flag de bypass disponível aos agentes. A exceção deve ser integrada deliberadamente à branch base antes da implementação dependente.

