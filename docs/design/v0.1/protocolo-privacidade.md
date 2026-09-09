# Protocolo de Privacidade Absoluta — Cartas do Oponente

**Projeto:** Truco Online v0.1
**Versão:** 0.1 (R2 corrigido)
**Base Git:** truco-online/t_245c3ab9-design-v0.1-r2-corrigir-fluxos-e-privaci

## Objetivo

Garantir zero vias de vazamento visual inadvertido de cartas do oponente em nenhuma fase da partida. O objetivo é privacidade absoluta: nem mesmo opacidade parcial, hover, animação ou indicador sutil pode revelar o conteúdo de um hand adversário.

---

## Regra fundamental

> NUNCA revelamos cartas do oponente através de:
> - Opacidade (fade-in, glassmorphism, semi-transparent layers)
> - Hover/click que altera cor/textura da carta rival
> - Animação que expõe valores antes da jogada
> - Bugs visuais ou efeitos colaterais de UI

---

## Implementação em 3D (R3F/three.js)

### Material padrão das cartas do peer

```javascript
// Exemplo de implementação correta no componente <Three.Mesh>
const backMaterial = new THREE.MeshPhongMaterial({
  color: 0x2a2a2a,        // tom escuro neutro
  emissive: 0x000000,
  specular: 0x111111,
});

// Oponente usa VERSO PADRÃO em todos os momentos
const opponentCard = new THREE.Mesh(geometry, backMaterial);
```

### Proibições explícitas

| Técnica | Status | Razão |
|---------|--------|-------|
| Opacidade 0.7-1.0 para cartas do rival | ❌ PROIBIDO | Revela "esboço" da carta via sombra/fundo |
| Hover que inverte a carta rival | ❌ PROIBIDO | Vazamento de informação ao passar mouse |
| Efeito "flip" automático na mesa | ❌ PROIBIDO | Exibe cartas antes do momento correto |
| Sombras com alpha variável | ⚠️ CUIDADO | Podem revelar contorno da carta via iluminação |

---

## Implementação em 2D (React + Framer Motion)

### Estado Sala em espera vs. Sala cheia

```tsx
// Cartas do hand do peer (opponentCards)
const renderCard = (cardType, isOpponent) => {
  return (
    <MotionDiv key={cardId} layout transition={{ type: "spring" }}>
      {isOpponent ? (
        // Usa material de verso em todas as transições
        <img src="/assets/carta-verso.png" alt="carta reverso" />
      ) : (
        <img src={`/assets/carta-${cardType}.png`} alt={cardDescription} />
      )}
    </MotionDiv>
  );
};

// NUNCA use: style={{ opacity: 0.8 }} para cartas do oponente
```

---

## Testes de regressão recomendados

```bash
# Valide que hover/click não altera material das cartas rival
playwright test --grep "opponent-card-privacy"

# Verifique redução de movimento preserve privacidade no iOS/macOS
test -d /tmp/motion-reduced && \
  grep -R "opacity:.*1.0|backFaceMaterial" .worktrees/t_245c3ab9 --include="*.tsx" | wc -l | xargs grep -F "backFaceMaterial" > /dev/null
# Se retorno >0, material back face está presente (OK)
```

---

## Mitigando efeitos colaterais

- **Efeito de arrastar cartas:** garantir que o peer não "revele" carta ao ser puxado para jogar
- **Animação de entrada da sala 3D:** usar fade simples sobrepondo material de verso em todas as cartas do rival
- **Feedback visual de jogada do rival:** apenas mostrar resultado final sem animação intermediária

---

## Checklist do designer (pré-commit)

- [ ] Todas as cartas do oponente usam `backFaceMaterial` ou equivalente
- [ ] Nenhum estilo inline contém `opacity < 1.0` para elementos adversários
- [ ] Transições de estado não alteram material da carta rival
- [ ] Teste manual: hover rápido em carta do oponente → nada visual muda

---

Este protocolo é **parte obrigatória** dos critérios de aceitação v0.1. Qualquer divergência será tratada como bug de UX e requer fix imediato antes da revisão.
