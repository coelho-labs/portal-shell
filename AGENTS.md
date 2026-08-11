# AGENTS.md — Portal Shell (MFE Host)

Este repositório é o **Core/Host** do ecossistema de Micro Frontends da Coelho Labs. Ele orquestra a "casca": layout global, slots de remotes, contextos compartilhados e overlay de transição. **Não contém regras de negócio** (planning poker, IA, backend FastAPI) — vivem em outros repositórios.

## Comandos

```bash
npm run dev      # servidor dev (Vite, porta 3000 por padrão)
npm run build    # tsc -b && vite build  (typecheck faz parte do build)
npm run lint     # eslint .
npm run preview  # servidor de produção (porta 4173)
```

- Não há test runner nem suíte de testes.
- Verificação padrão de uma mudança: `npm run lint` e `npm run build`.

## Module Federation (não confunda!)

- O pacote instalado/configurado é **`@module-federation/vite`** (oficial, v1.20.x). README e docs citam `@originjs/vite-plugin-federation` — **está desatualizado, ignore**. Não instale o `@originjs` para novas features.
- A config do federation fica em `module-federation.config.ts` (separada), importada pelo plugin `federation()` no `vite.config.ts`.
- Para adicionar um remote MFE: registre em `remotes` do `module-federation.config.ts` e mantenha `shared` em sincronia (`react`, `react-dom`, `react-router-dom` como `singleton: true`) — duplicar React entre host e remotes quebra o runtime.
- A config atual é **provisória**: o remote `remoteApp` em `http://localhost:4173/assets/remoteEntry.js` é placeholder, pois ainda não existe nenhum remote real. O Host renderiza rotas nativas (`/`) sem depender de remotes; a renderização completa das rotas remotas exige os projetos remotos rodando.

## Stack real (verifique, não confie no README)

- **React 19** (não 18), **react-router-dom v7**, **Vite 8**, **TypeScript ~6**.
- **Tailwind NÃO está instalado** apesar do README mencionar. Layout em CSS Grid/Tailwind (`sticky top-20`, `hidden lg:block`, `1fr` central) é plano arquitetural, não implementado. A UI atual é provisória (starter do Vite em `src/pages/home/`). Ao mexer em visual, decida: adicionar Tailwind ou seguir com CSS puro.
- **React Compiler** habilitado via `@rolldown/plugin-babel` + `reactCompilerPreset()` no `vite.config.ts` — memoização é automática, não otimize manualmente com `useMemo`/`useCallback` sem necessidade.

## TypeScript / lint (armadilhas reais do tsconfig)

- `erasableSyntaxOnly: true` (TS 6): **proibido** `enum`, `namespace` e *parameter properties* (`constructor(private x)`) — use `union types`/objetos.
- `verbatimModuleSyntax: true`: use `import type` para importações somente de tipo.
- `allowImportingTsExtensions: true` + bundler mode: imports usam extensão explícita (ex: `./pages/home/Home.page.tsx`).
- `noUnusedLocals`/`noUnusedParameters` ativos.

## Contrato arquitetural (para implementação futura)

- **Layout Core-driven:** gavetas laterais de anúncio fixas de `200px` com `sticky`; ocultas abaixo de `lg` (`hidden lg:block`); `<main>` isolado na coluna central `1fr` (colunas laterais ficam para o remote de AdSense — repo separado).
- **Fluxo "Criar Sala" (vignette):** o overlay de transição é gerenciado pelo Core (visual), injetando texto dinâmico + `onCloseCallback`; a feature remota (planning-poker) gerencia estado de negócio e usa `Promise.all` entre `POST /rooms` (backend FastAPI, repo separado) e um timer local de **5000ms**, redirecionando para `/room/:id` só com ambas resolvidas. Sem BFF — frontend fala direto com a API/WebSocket do FastAPI.

## Notas

- adSense/metrics e backend FastAPI são privados e ficam em outros repositórios.
