# Operação da equipe Hermes

Os arquivos em `configs/` e `profiles/` são as fontes versionadas das configurações e SOULs instalados em `/opt/data/profiles/<perfil>`.

## Ativação do Telegram

Antes de iniciar os gateways:

1. Crie os nove bots no BotFather.
2. Habilite comunicação bot-to-bot.
3. Desabilite privacy mode de todos os bots.
4. Crie `Truco Online — Equipe` e adicione os bots depois de mudar privacy mode.
5. Atualize `telegram-roster.yaml` com usernames reais e o chat ID.
6. Grave cada token somente no `.env` do perfil correspondente.
7. Atualize `allowed_chats`, `group_allowed_chats` e `platforms.telegram.enabled` nos nove `config.yaml` instalados.
8. Inicie com `docker compose --profile team up -d` no diretório da infraestrutura.

O comando inicial do CEO é `[VERSAO:vX.Y]`. Apenas `produto` tem um padrão de ativação para essa mensagem sem menção; nos demais casos use menção ou reply.

## Fontes de verdade

- SOUL define identidade e limites do papel.
- Skills corporativas definem políticas reutilizáveis.
- `AGENTS.md` e `docs/governance/` governam o repositório.
- Kanban mantém execução, dependências e evidências.
- Telegram serve para colaboração visível, não para armazenar a única cópia de decisões.

