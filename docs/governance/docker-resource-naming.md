# Padrão de recursos Docker — Truco Online

Este documento evita nomes aleatórios, recursos órfãos e colisões entre worktrees. O agrupamento visível no Docker Desktop é determinado pelo **nome do projeto Compose**, não apenas pelo nome do contêiner.

## Projetos canônicos

| Uso | Projeto Compose | Duração |
|---|---|---|
| Homologação da release | `truco-online-hml` | Persistente até deploy ou rollback documentado |
| Desenvolvimento compartilhado | `truco-online-dev` | Enquanto necessário e com responsável conhecido |
| CI, teste ou SPIKE de um card | `truco-online-ci-t-12345678` | Somente durante a execução do card |

O ID `t_12345678` vira `t-12345678`. Nunca use o diretório do worktree como projeto implícito. Todos os arquivos Compose declaram `name:` na raiz:

```yaml
name: truco-online-hml

x-truco-labels: &truco-labels
  com.codifydeep.project: truco-online
  com.codifydeep.environment: hml

services:
  web:
    labels: *truco-labels
```

Deixe o Compose produzir nomes como `truco-online-hml-web-1`. Um `container_name` explícito geralmente impede escala e não deve ser usado.

## Execução temporária

Para um card, passe o projeto exato em todos os comandos, mesmo que o arquivo já tenha `name:`:

```bash
docker compose -p truco-online-ci-t-12345678 -f compose.ci.yml up -d --build
docker compose -p truco-online-ci-t-12345678 -f compose.ci.yml down --remove-orphans
```

Se `docker run` for realmente necessário, prefira um processo descartável:

```bash
docker run --rm \
  --name truco-online-ci-t-12345678-smoke \
  --label com.codifydeep.project=truco-online \
  --label com.codifydeep.environment=ci \
  --label com.codifydeep.kanban=t_12345678 \
  truco-online/app:test
```

O card registra projeto, contêineres, redes, volumes, imagens e o resultado da limpeza.

## Verificação antes de limpar

1. Confirme que o card proprietário terminou ou foi arquivado.
2. Confirme que não há worker do card ativo.
3. Inspecione labels e mounts dos recursos exatos.
4. Remova o projeto temporário com `down --remove-orphans`.
5. Remova volume com `-v` somente se ele foi criado pelo card e não contém evidência ou dados de homologação.
6. Remova uma imagem experimental apenas quando nenhum contêiner restante a referencia.

São proibidos `docker system prune`, `docker container prune`, `docker volume prune`, remoções por glob e qualquer operação sobre projetos que não sejam `truco-online-*`.
