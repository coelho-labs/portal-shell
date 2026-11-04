# plan.md — Portal Shell

> Único lugar com status de implementação. **AGENTS.md** = contrato atemporal; **README.md** = onboarding humano.

**Última atualização:** `9aaefa1` · 2026-11-04

## Status por fase

| Fase | Status | Observações |
| --- | --- | --- |
| Shell base (layout, Home, footer) | ✅ Concluída | header sticky + `<main>` + footer |
| Tema cross-MFE (Host) | ✅ Concluída | `.dark`, `colorScheme`, `coelho-theme`, anti-FOUC |
| Federation: `planning-poker` | ✅ Concluída | manifest + DTS + rota `/planning/*` |
| Federation: `json-formatter` | ✅ Concluída | manifest + DTS + rota `/json-formatter/*` |
| Testes unitários/integração | ✅ Concluída | Vitest + Testing Library, 62 testes |
| Mutation testing | ✅ Concluída | Stryker, gate 90%, score 96,30% |
| Remoção do `content-delivery` | ✅ Concluída | remote não é mais carregado pelo Host |

## Decisões datadas

- **2026-11-04** — Testes seguem padrão Given/when/then, co-localizados, com uma asserção por `then`.
- **2026-11-04** — `tsconfig.test.json` é referenciado pela solution para a IDE não cair em projeto inferido.
- **2026-11-04** — Build typechecka apenas `tsconfig.app.json` + `tsconfig.node.json`; testes ficam em `test:types`.
- **2026-11-04** — Stryker com `thresholds.break: 90`; `clearTextReporter.skipFull: true` no resumo.
- **2026-11-04** — Testes de mutação elevados de 77,92% para 96,30% com cobertura de fallback de remote, entrypoint e branches do tema.
- **2026-11-04** — `content-delivery-mfe` foi descontinuado e removido da configuração de federation do Host.

## Armadilhas aprendidas

- Testes com erro na IDE → projeto inferido; falta referenciar `tsconfig.test.json` na solution.
- Stryker "mostrando só um arquivo" → `clearTextReporter.skipFull: true` oculta arquivos com 100% dos mutantes mortos.
- 3 mutantes equivalentes em `use-theme.ts`: `value === "system"` redundante (o fallback já é `"system"`) e `[]` vs array constante de dependências do effect.
- React lançando erro de render quando o remote resolve `null` pode virar `RuntimeError` no Stryker; usar Error Boundary no teste converte em falha de asserção normal.
- `loadRemote` não tem Error Boundary de produção: falha de rede do remote ainda pode borbulhar para a árvore.
