# Checklist de QA — Estados e Transições v0.1

**Projeto:** Truco Online
**Versão:** 0.1 (R2 corrigido)

## Instruções gerais

1. Abra o build em mobile/desktop + modo landscape/portrait conforme especificado.
2. Teste teclado: navegação com Tab entre botões + focus ring visível (>2px).
3. Embaralhe navegador (Chrome DevTools → Accessibility → Reduce motion) e valide que animações não vazam conteúdo adversário.

---

## Estado Vazio

| Critério | Como testar | Aprovado se ... |
|----------|-------------|-----------------|
| CTA único visível | Clique no botão "Criar Sala" | Apenas este botão em foco principal |
| Links acessórios clicáveis | Tab até Sair/Termos | Navegação correta sem trap |
| Responsivo | Redimensione viewport de 1920→375px | Layout adapta (H1 não quebra linhas >60) |
| Reduced motion | Reduce-motion: reduce ativado | Spinners/animações substituídos por mensagens estáticas |
| Erro de rede | Desligue WiFi e recarregue | Estado Erro aparece (<3s delay) |

---

## Estado Carregando

| Critério | Como testar | Aprovado se ... |
|----------|-------------|-----------------|
| Feedback imediato | Overlay aparece após clique | Spinner/texto dentro de 500ms do evento socket |
| Pular carregamento | Botão "Entrar" presente? | Não é obrigatório (vazio → sala em espera direto) |
| Fallback WebGL | Simule erro de canvas | Mensagem "WebGL indisponível" + botão Tentar Novamente |

---

## Estado Erro

| Critério | Como testar | Aprovado se ... |
|----------|-------------|-----------------|
| Mensagem clara | "Conexão não pôde ser estabelecida." | Texto com frase exata (sem código de erro) |
| Botão reconectar | Clique em reconectar após falha WebSocket | Tentativa nova iniciada sem recarregar página completa |
| Sugestiónes úteis | Verifique tooltip/help text | Não sugere "botões ocultos" ou fluxo inválido |

---

## Sala em espera

| Critério | Como testar | Aprovado se ... |
|----------|-------------|-----------------|
| Lista da sala | Exibe nome/host do peer atual | Info aparece sem delay artificial |
| Status explícito | "Aguardando 1 jogador..." | Mensagem é statica (sem countdown falso) |
| Transição automática | Simule entrada de segundo jogador (socket) | UI swap para 3D dentro de <2s (não há botão "Começar") |
| Hand privado | Cartas do peer renderizadas como verso padrão | Zero opacidade (<1.0 proibido) |

---

## Sala cheia / Partida 3D

| Critério | Como testar | Aprovado se ... |
|----------|-------------|-----------------|
| Indicador de turno | Círculo/destaque ao redor da mão ativa | Apenas jogador atuante com highlight |
| Botões de ação | Chamem, truques disponíveis | Desativados para não-atuante |
| Feedback jogada | Animação + atualização mesa imediata | Zero delay >100ms na UI |
| Privacidade peer | Carta rival durante sua jogada | Material back face mantém-se 1x |

---

## Reconexão

| Critério | Como testar | Aprovado se ... |
|----------|-------------|-----------------|
| Overlay "Reconectando" | Simule desconexão (WebSocket.close(1001)) | Barra de progresso ou status textual aparecendo |
| Falha persistente | Reinicie servidor após desconexão múltipla | Estado Erro com botão Sair/Criar Nova Sala aparece |

---

## Privacidade absoluta de mãos

| Critério | Como testar | Aprovado se ... |
|----------|-------------|-----------------|
| Hover não vaza | Passe mouse sobre cartas do oponente | Opacidade/cor/material permanece inalterado |
| Efeito flip na mesa | Simule carta jogada | Cartas do rival não aparecem durante animação |
| Material consistente | Inspeção de cena (R3F) | Apenas back face para peer |

---

## Privacidade reduzida motion

| Critério | Como testar | Aprovado se ... |
|----------|-------------|-----------------|
| Animações canceladas | Reduced-motion: reduce no macOS/iOS | Transições instantâneas (não fade-in/slide) |
| Feedback mínimo | Erro na reconexão | Piscar rápido em vez de ciclo animado |

---

## Viewport responsivo / Touch targets

| Critério | Como testar | Aprovado se ... |
|----------|-------------|-----------------|
| Altura mesa 3D | Redimensione para iPhone SE (375px wide) | Cartas não sobrepolam UI |
| Touch targets ≥48px | Meça botão "Chamar" em Safari | Altura/min-width >=48px (CSS inspect) |
| Layout portrait fallback | Rode no iPad vertical | Partida com cartela compactada (não break) |

---

## Contraste / Legibilidade

| Critério | Como testar | Aprovado se ... |
|----------|-------------|-----------------|
| Escala 4.5:1 | Use Contrast Checker + ferramentas nativas do navegador | Texto principal >18.4px a 23.7pt (WCAG AA) |
| Hover state distinto | Clique no botão CTA em diferentes cores de tema | Diferença mínima de luminância ≥3.0 entre hover e default |
| Foco via teclado | Navegue com Tab até "Criar Sala" | Ring ≥2px + cor de contraste mínimo |

---

## Ordem lógica de foco (teclado)

| Passo | Elemento esperado | Se passar na lista |
|-------|-------------------|--------------------|
| 1     | Criar Sala        | ✓                     |
| 2     | Sair              | ✓                     |
| 3     | Termos            | ✓                     |
| 4     | Reconnect         | (no erro)             |

---

## Documentação cross-referenciada

- Protocolo privacidade completo: `docs/design/v0.1/protocolo-privacidade.md`
- ADR stack: `docs/adr/0001-stack-v0.1.md`
- Product Brief v0.1: `docs/product/brief-v0.1-R2.md` (conforme commit fd65a92)

---

**Status deste checklist:** _em desenvolvimento_ — gerar evidências de PR antes de `review-request`.
