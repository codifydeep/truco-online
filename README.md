# Truco Online

Repositório da prova de conceito de uma equipe Hermes que desenvolve um SaaS com aplicações web e mobile. O CEO define cada versão; a equipe planeja, implementa com TDD e só conclui a release depois da validação no ambiente local de homologação.

## Estado inicial

O repositório contém a governança, os perfis Hermes, as skills corporativas e os quality gates. A stack do produto será definida pelo CTO no primeiro ADR depois da aprovação do Product Brief da versão `v0.1`.

## Regras essenciais

- Uma única release ativa por vez.
- `main` é a linha estável; o trabalho ocorre em `release/vX.Y`.
- Implementações usam `feat/<kanban-id>-<slug>` e PR contra a release ativa.
- TDD Red-Green-Refactor é obrigatório.
- Testes preexistentes não podem ser removidos, pulados ou enfraquecidos.
- O Kanban é a fonte de verdade do trabalho; Git e ADRs são a fonte de verdade dos artefatos e decisões.
- O único término bem-sucedido de uma release é `HOMOLOGADA`.

Consulte [AGENTS.md](AGENTS.md), [ciclo de release](docs/governance/release-lifecycle.md) e [política de TDD](docs/governance/tdd-policy.md).

