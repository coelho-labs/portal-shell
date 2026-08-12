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
  - **NUNCA coloque `include`/`paths` no `tsconfig.json` raiz** (arquivo solution com `files: []`): ele não tem `compilerOptions` e o `tsc -b` quebra compilando `src` com defaults. Tudo vai no `tsconfig.app.json`.

### Tipos do remote (`@mf-types`)

- Baixados automaticamente pelo `dts.consumeTypes` do host (`typesFolder: "@mf-types"`, `typesOnBuild: true`). Exige o remote com `dts: true` — embora, se `dts` estiver ausente e o projeto for TS (tem `tsconfig.json`), o plugin já habilita por padrão (`isTSProject`).
- É **artefato gerado de outro repo**: gitignorado (`@mf-types`, `.mf-types`, `.dev-server`) E ignorado no eslint (`globalIgnores` no `eslint.config.js`) — senão `no-explicit-any` dispara nos d.ts gerados.
- Quando `@mf-types/planning-poker/` existir, a tipagem do `loadRemote` fica completa. Sem o remote rodando, o build do host NÃO quebra (só degrada a tipagem).

### Requisitos no remote (repo planning-poker)

- `manifest: true` e `dts: true` explícitos.
- CORS: em dev o Vite já envia; em build/preview o servidor estático do remote precisa mandar `Access-Control-Allow-Origin` — sem CORS, `RUNTIME-001` / `Failed to get remoteEntry exports`.
- `server.origin` e `base` consistentes (dev: `http://localhost:4175`; prod: domínio final).
- O `RemoteAppEntry` exposto NÃO deve montar seu próprio `<BrowserRouter>` — `react-router-dom` é singleton compartilhado e o host fornece o roteamento; exponha componentes/elementos de rota (sem router próprio).

### Troubleshooting (conhecidos)

- `RUNTIME-001` / `Failed to get remoteEntry exports` → CORS no remote ou URL errada; testar `curl http://localhost:4175/mf-manifest.json`.
- Remote não registra no primeiro load em dev → gotcha do plugin; fallback: `registerRemotes([{ name, type: "module", entry: import.meta.env.VITE_PLANNING_POKER_ENTRY }])` de `@module-federation/runtime` no início do `main.tsx`.
- `eslint` reclamando de `any` em `@mf-types/` → pasta gerada; já está nos `globalIgnores`.
- `tsconfig.tsbuildinfo` solto na raiz → artefato do `tsc -b`, já no `.gitignore` (`*.tsbuildinfo`).

## Stack real (verifique, não confie no README)

- **React 19** (não 18), **react-router-dom v7**, **Vite 8**, **TypeScript ~6**.
- **`@module-federation/runtime` v2.8.x** é dependência direta (não só transitiva), pinada à versão que `@module-federation/vite` usa — garante UMA única instância do runtime entre plugin e `loadRemote`.
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
