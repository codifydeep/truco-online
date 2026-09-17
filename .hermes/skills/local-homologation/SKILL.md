---
name: local-homologation
description: Validate and deliver a release in local Docker with independent post-deploy QA and immutable evidence.
---

# Homologação local

Leia AGENTS.md, a release ativa, os critérios aprovados e o ADR. Em manutenção
ou antes do ensaio aprovado, não implante produto.

Use somente infraestrutura Docker local, sem cloud, serviços pagos ou lojas.
v0.1 é exclusivamente web: não construir APK, Expo ou qualquer artefato mobile.
Releases futuras só incluem mobile quando isso constar do brief aprovado.

Implante commit imutável, valide Compose, recursos, portas, labels, saúde,
logs e rollback. Nunca exponha segredos. Projeto de homologação:
truco-online-hml; experimentos: truco-online-ci-ID normalizado.

Registre o mesmo SHA nos serviços e nas evidências. QA independente executa
testes pós-deploy, integração, E2E, regressão e segurança e registra comandos
e saídas reais. Deploy saudável sozinho não comprova comportamento correto.

Tech Lead entrega URL, SHA, PRs, evidências, limitações e rollback após todos
os critérios aprovados serem verificados. Nunca declare sucesso só porque um
arquivo de relatório foi preenchido.

Limpeza somente de recursos exatos do próprio card, depois de verificar
labels, mounts e ausência de uso. Não usar prune global nem excluir dados
persistentes como limpeza incidental.
