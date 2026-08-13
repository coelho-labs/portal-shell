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
- **`module-federation.config.ts` exporta uma FUNÇÃO `mfConfig(env)`**, não um objeto estático. O `vite.config.ts` usa `defineConfig(({ mode }) => ...)` + `loadEnv(mode, process.cwd())` e injeta `mfConfig(env)` no `federation(...)`. Assim URLs de remote mudam por ambiente via `.env` (`VITE_*`), sem editar código. O `loadEnv` é importado SÓ no `vite.config.ts` — no `module-federation.config.ts` o `env` chega como parâmetro (importar lá dá `no-unused-vars`/`noUnusedLocals`).

### Remote (provider)

- Registre o remote em `remotes` usando a **forma de objeto**:
  ```ts
  "planning-poker": {
    type: "module",          // obrigatório: remote Vite é ESM; sem isso o runtime tenta "var" e falha
    name: "planning-poker",  // nome registrado no config DO REMOTE
    entry: env.VITE_PLANNING_POKER_ENTRY ?? "http://localhost:4175/mf-manifest.json",
  }
  ```
  - **A chave (alias) DEVE ser igual ao `name` do remote** — é o que aparece em `loadRemote("planning-poker/...")`.
  - **Prefira `mf-manifest.json` a `remoteEntry.js`**: o path do remoteEntry difere entre dev (`/remoteEntry.js`) e build/preview (`/assets/remoteEntry.js`); o manifest resolve `publicPath` + entry corretos em cada ambiente. Requer `manifest: true` no remote (planning-poker já tem).
- Mantenha `shared` em sincronia com o remote (`react`, `react-dom`, `react-router-dom` como `singleton: true`, com `requiredVersion` do `package.json`) — duplicar React entre host e remotes quebra o runtime.

### Consumo das rotas remotas

- **Use `loadRemote` de `@module-federation/runtime`** (dependência direta, versão pinada à que o plugin usa — hoje `2.8.2`) combinado com `React.lazy`:
  ```tsx
  const PlanningPoker = lazy(() =>
    loadRemote<{ default: ComponentType }>("planning-poker/RemoteAppEntry").then(
      (mod) => ({ default: mod?.default ?? ((): null => null) as ComponentType }),
    ),
  );
  ```
  - O generic explícito faz o TS cair na assinatura original (`Promise<T | null>`) e **typecheck passa mesmo sem `@mf-types/` baixado** (importante: `npm run build` roda `tsc -b` ANTES de o plugin baixar os tipos na fase `vite build`).
  - **NÃO use `import("planning-poker/RemoteAppEntry")` direto** no código.
- **Tsconfig é a chave da tipagem** (`tsconfig.app.json`):
  - `"paths": { "*": ["./@mf-types/*"] }` — faz o specifier `planning-poker/RemoteAppEntry` resolver para `@mf-types/planning-poker/RemoteAppEntry.d.ts`. Sem isso, o `typeof import('planning-poker/RemoteAppEntry')` dentro de `@mf-types/.../apis.d.ts` não resolve e a tipagem do `loadRemote` degrada.
  - `"include": ["src", "@mf-types"]` — carrega o `@mf-types/index.d.ts` com a *augmentation* do `loadRemote`.
  - **`tsconfig.json` raiz (solution, `files: []`) tem UMA exceção deliberada:** `compilerOptions.baseUrl` + `paths` (`"@/*": ["./src/*"]`) existem lá — o CLI shadcn resolve o path de escrita via `tsconfig-paths`, que SÓ lê o tsconfig raiz; sem isso ele cria pasta literal `@/` na raiz. **NUNCA adicione `include`/`files` de código nele** (senão `tsc -b` compila `src` com defaults e quebra). O resto da tipagem fica no `tsconfig.app.json`.

### Tipos do remote (`@mf-types`)

- Baixados automaticamente pelo `dts.consumeTypes` do host (`typesFolder: "@mf-types"`, `typesOnBuild: true`). Exige o remote com `dts: true` — embora, se `dts` estiver ausente e o projeto for TS (tem `tsconfig.json`), o plugin já habilita por padrão (`isTSProject`).
- É **artefato gerado de outro repo**: gitignorado (`@mf-types`, `.mf-types`, `.dev-server`) E ignorado no eslint (`globalIgnores` no `eslint.config.js`) — senão `no-explicit-any` dispara nos d.ts gerados.
- Quando `@mf-types/planning-poker/` existir, a tipagem do `loadRemote` fica completa. Sem o remote rodando, o build do host NÃO quebra (só degrada a tipagem).

### Requisitos no remote (repo planning-poker)

- `manifest: true` e `dts: true` explícitos.
- CORS: em dev o Vite já envia; em build/preview o servidor estático do remote precisa mandar `Access-Control-Allow-Origin` — sem CORS, `RUNTIME-001` / `Failed to get remoteEntry exports`.
- `server.origin` e `base` consistentes (dev: `http://localhost:4175`; prod: domínio final).
- O `RemoteAppEntry` exposto NÃO deve montar seu próprio `<BrowserRouter>` — `react-router-dom` é singleton compartilhado e o host fornece o roteamento; exponha componentes/elementos de rota (sem router próprio).
- **NÃO renderize `<main>`** no RemoteAppEntry — o host já emite o landmark `<main>` do layout; dois `<main>` não-ocultos é HTML inválido. Use `<section>`/`<div>`.
- **Sem regras globais `body`/`#root`** no CSS do remote — vazam e brigam com o layout/background do host.
- **Fase 2 (tema) pendente:** espelhar `src/index.css` do host (tokens oklch + `@custom-variant dark`) no remote e importá-lo no `RemoteAppEntry` (o host só recebe o CSS via o entry consumido); migrar cores hardcoded para `var(--token)` e remover blocos `@media (prefers-color-scheme)` (o `.dark` do host já resolve).

### Troubleshooting (conhecidos)

- `RUNTIME-001` / `Failed to get remoteEntry exports` → CORS no remote ou URL errada; testar `curl http://localhost:4175/mf-manifest.json`.
- Remote não registra no primeiro load em dev → gotcha do plugin; fallback: `registerRemotes([{ name, type: "module", entry: import.meta.env.VITE_PLANNING_POKER_ENTRY }])` de `@module-federation/runtime` no início do `main.tsx`.
- `eslint` reclamando de `any` em `@mf-types/` → pasta gerada; já está nos `globalIgnores`.
- `tsconfig.tsbuildinfo` solto na raiz → artefato do `tsc -b`, já no `.gitignore` (`*.tsbuildinfo`).
- `shadcn add` criando pasta literal `@/` na raiz → faltam `compilerOptions.baseUrl`+`paths` no `tsconfig.json` raiz (ver seção de tsconfig).
- `<button>` dentro de `<button>` no ThemeToggle → o `Trigger` do Base UI renderiza `<button>`; use `render={<Button/>}` (ver seção UI/Design System).
- `react-refresh/only-export-components` em `src/components/ui/*` mesmo com `allowConstantExport` → normal na v0.5.4 (`cva()` é `CallExpression`); a regra é `off` escopado a `ui/**` (ver seção lint).
- `react-hooks/set-state-in-effect` → derive o estado no render; `setState` síncrono em effect é erro. `setState` só em callback de subscription (padrão de referência: `use-theme.ts`).

## Stack real (verifique, não confie no README)

- **React 19** (não 18), **react-router-dom v7**, **Vite 8**, **TypeScript ~6**.
- **`@module-federation/runtime` v2.8.x** é dependência direta (não só transitiva), pinada à versão que `@module-federation/vite` usa — garante UMA única instância do runtime entre plugin e `loadRemote`.
- **Tailwind v4 + shadcn/ui instalados** (README desatualizado). Visual usa tokens do design system — ver seções "UI / Design System" e "Tema". A Home page é o demo do Vite remasterizado em Tailwind (assets em `src/assets/`, sprite `public/icons.svg`).
- **React Compiler** habilitado via `@rolldown/plugin-babel` + `reactCompilerPreset()` no `vite.config.ts` — memoização é automática, não otimize manualmente com `useMemo`/`useCallback` sem necessidade.

## UI / Design System (shadcn + Tailwind v4 + Base UI)

- Tailwind v4 (CSS-first): plugin `@tailwindcss/vite` no `vite.config.ts`; `@import "tailwindcss"` + `@custom-variant dark (&:is(.dark *));` + tokens oklch em `:root`/`.dark` no `src/index.css`.
- shadcn via `npx shadcn@latest add <componente>`. `components.json`: style `base-nova`, `cssVariables: true`, iconLibrary `lucide`, fonte Geist (`@fontsource-variable/geist`).
- **Base UI (`@base-ui/react`), NÃO Radix** — default do shadcn desde jul/2026 (Radix em wind-down). API usa prop **`render`** no lugar do `asChild`.
  - `Menu.Trigger`, `Button` etc. renderizam `<button>` por padrão → **NUNCA aninhe um `<Button>` dentro de `<DropdownMenuTrigger>`**; use `render={<Button .../>}` (o Base UI clona e o elemento vira o trigger). Vale para qualquer `*Trigger`.
- Componentes em `src/components/ui/`, helper `cn()` em `src/lib/utils.ts` (clsx + tailwind-merge), alias `@` → `src/` (vite.config.ts + `tsconfig.app.json` + `tsconfig.json` raiz).
- Use tokens (`bg-background text-foreground border-border ...`) — sem hex hardcoded. Utilities `dark:` dependem do `@custom-variant`.

## Tema (contrato cross-MFE)

- **Host é dono do tema em runtime**: toggla `.dark` no `<html>` + `colorScheme`, via `useTheme()` (`src/hooks/use-theme.ts`).
- Chave de storage **`coelho-theme`** duplicada em 2 lugares: hook E script anti-FOUC inline de `index.html` — manter em sincronia.
- Padrão do hook (referência p/ `react-hooks/set-state-in-effect`): `theme` (light|dark|system) + `system` (SO via `matchMedia`); **`resolved` derivado no render**, `setState` só em callback de subscription; o effect só sincroniza o DOM.
- Remotes: duplicam o `index.css` (tokens idênticos ao host) e importam no próprio entry consumido; o host continua dono do `.dark`.

## TypeScript / lint (armadilhas reais do tsconfig)

- `erasableSyntaxOnly: true` (TS 6): **proibido** `enum`, `namespace` e *parameter properties* (`constructor(private x)`) — use `union types`/objetos.
- `verbatimModuleSyntax: true`: use `import type` para importações somente de tipo.
- `allowImportingTsExtensions: true` + bundler mode: imports usam extensão explícita (ex: `./pages/home/Home.page.tsx`).
- `noUnusedLocals`/`noUnusedParameters` ativos.
- `eslint.config.js` (flat config): `react-refresh/only-export-components` é `off` APENAS em `src/components/ui/**`, num bloco **separado e DEPOIS** do bloco principal (ordem do array = precedência). Motivo: shadcn exporta consts de variantes via `cva(...)`; `allowConstantExport` (já default no preset vite) na v0.5.4 só cobre `Literal`/`UnaryExpression`/`TemplateLiteral`/`BinaryExpression` — `CallExpression` (`cva`) não passa, então sem o escopo `off` o lint quebra em todo componente ui.
- `react-hooks/set-state-in-effect` (v7) ativo e é regra séria: derive estado no render; `setState` síncrono em effect quebra o lint.
- `globalIgnores` já cobre `dist`, `**/@mf-types/**`, `.mf-types` e `.dev-server`.

## Contrato arquitetural

- **Layout Core-driven — IMPLEMENTADO** (`src/App.tsx`): header `sticky top-0 h-20` (marca + nav + `ThemeToggle`), grid `grid-cols-1 lg:grid-cols-[200px_1fr_200px]`, gavetas de anúncio `hidden lg:block` com `sticky top-20 h-[calc(100svh-5rem)]` — slots placeholder que vão para o remote de AdSense (repo separado) —, `<main>` isolado na coluna central `min-w-0`.
- **Fluxo "Criar Sala" (vignette) — FUTURO:** o overlay de transição é gerenciado pelo Core (visual), injetando texto dinâmico + `onCloseCallback`; a feature remota (planning-poker) gerencia estado de negócio e usa `Promise.all` entre `POST /rooms` (backend FastAPI, repo separado) e um timer local de **5000ms**, redirecionando para `/room/:id` só com ambas resolvidas. Sem BFF — frontend fala direto com a API/WebSocket do FastAPI.

## Notas

- adSense/metrics e backend FastAPI são privados e ficam em outros repositórios.
