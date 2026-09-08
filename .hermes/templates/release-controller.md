# RELEASE-vX.Y

## Controle

- Estado lógico: `EM_DESCOBERTA`
- CEO: `Telegram user ID`
- Product Brief: `caminho ou pendente`
- Aprovação do brief: `mensagem/data ou pendente`
- Branch: `release/vX.Y ou pendente`
- Commit candidato: `SHA ou pendente`
- Última transição: `AAAA-MM-DD HH:MM TZ`

## Escopo aprovado

- Objetivo:
- Dentro do escopo:
- Fora do escopo:
- Critérios de sucesso:

## Grafo da entrega

- Cards filhos e dependências:
- Cards em falha/recuperação:
- SPIKEs ativos:
- Decisão aguardada do CEO:

## Gates de homologação

- [ ] CI completa verde no commit candidato
- [ ] Revisões independentes aprovadas
- [ ] Compose validado e ambiente local implantado
- [ ] Health checks aprovados
- [ ] Testes E2E e regressão no ambiente implantado
- [ ] Verificações de segurança aprovadas ou risco aceito pelo CEO
- [ ] URL web e endpoints de API registrados
- [ ] APK Android e checksum registrados, quando aplicável
- [ ] Instruções Expo Go registradas, quando aplicável
- [ ] Limitações e rollback documentados
- [ ] Validação final de `quality_security`

## Evidências finais

- Relatório da release:
- PRs:
- Comandos e resultados:
- URL/API:
- APK/Expo Go:
- Limitações:

O card não pode ser concluído enquanto o estado lógico não for `HOMOLOGADA` ou `CANCELADA_PELO_CEO`. Somente a primeira opção representa sucesso.
