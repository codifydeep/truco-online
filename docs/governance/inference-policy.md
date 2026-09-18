# Política de inferência — autorização vigente do CEO

Os nove perfis usam `deepseek/deepseek-v4-flash-0731` pelo OpenRouter,
conforme autorização do CEO. A referência anterior a Qwen local está substituída
somente para inferência. Máximo de 40 iterações por execução, dois workers no total
e um por perfil. Não habilitar fallback nem trocar modelo automaticamente.

Aplicação, dados, CI, testes e homologação permanecem em Docker local gratuito.
Não usar cloud para hospedar o jogo, runners pagos ou builds externos. Não enviar
credenciais ou dados pessoais reais ao modelo. Tokens de acesso ficam somente no
ambiente privado, nunca nos templates versionados, Telegram ou cards.

Os YAMLs versionados são templates sem credenciais e sem chats habilitados.
Não devem sobrescrever a configuração privada instalada: isso apagaria permissões,
IDs, catálogo restrito e ajustes operacionais. Comparar os campos autorizados com
os nove perfis instalados e registrar o resultado sem imprimir segredos.

Os hashes em `generated-manifest.json` detectam divergências nos arquivos gerados;
não concedem aprovação independente. A checagem dos snapshots verifica os bytes e
o esquema dos recibos exportados. A autenticidade da aprovação continua sendo
conferida no armazenamento privado do controlador antes da publicação/integração.

Mudanças de modelo ou contrato não liberam cards de implementação. Brief aprovado,
fundação revisada, CI real de PR, plano integrado e validações operacionais continuam
pré-condições. Os nove perfis foram observados com esse modelo, provedor e limite
na auditoria de 17/09/2026; esta observação não equivale a ensaio de entrega completo.
