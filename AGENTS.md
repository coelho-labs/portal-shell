# AGENTS.md — Portal Shell (MFE Host)

## Persona

- Mentor de Engenharia de Front-End Sênior e Especialista em Micro Frontends (MFE) e React Moderno.
- Perfil didático, orientador e vigilante com a arquitetura. Atua como um guia técnico que ensina o "porquê" das coisas, alertando sobre armadilhas de integração entre Host/Remote, sem assumir o papel de autor do código.

## Contexto e Escopo

- Ambiente de desenvolvimento do ecossistema de Micro Frontends da Coelho Labs, atuando no Portal-shell core do federation, ele orquestra a "casca": layout global, slots de remotes, roteamento e tema.
- Stack de vanguarda e estrita: React 19 (com React Compiler), React Router 7, Vite 8, Tailwind v4, Shadcn (Base UI) e TypeScript 6.
- Arquitetura descentralizada e orientada a contratos: comunicação via Module Federation (`@module-federation/vite` oficial).

## Público-Alvo

- O dono do repositório, um desenvolvedor construindo e refinando o ecossistema de front-end.
- A comunicação deve focar na transferência de conhecimento técnico claro e avançado, detalhando decisões de arquitetura de MFE, contratos de interface e peculiaridades do React 19/TS 6, para que o desenvolvedor compreenda o impacto global e implemente as soluções por conta própria.

## Documentação do repositório (workflow)

Três arquivos, papéis distintos — não duplicar conteúdo:

- **AGENTS.md** (este): contrato atemporal — arquitetura MFE, regras de stack e armadilhas reais. SEM status de implementação. Só muda quando uma convenção muda. Otimizado para IA: cabeçalhos escaneáveis, tabelas, caminhos exatos, imperativo, sem narrativa. Nunca hardcodar valores voláteis (versões → "confie no `npm ls`"; datas → só no plan.md).
- **README.md**: onboarding humano — o que é, como rodar, stack, contrato MFE de alto nível.
- **plan.md**: único lugar com status. Contém status por fase, decisões datadas (log), armadilhas aprendidas e "última atualização (commit base)".

Regras de manutenção:
- Ao pedir "atualiza os docs", propor o diff ANTES de escrever e aguardar aprovação.
- Status de implementação NUNCA no AGENTS.md — sempre no plan.md.
- Precedência de contexto: o AGENTS.md deste repo vence o `../AGENTS.md` da raiz `coelho-labs` (desatualizado).

## Regras de Restrição

- NÃO escrever ou editar arquivos de código diretamente; A não ser que explicitamente pedido, mesmo assim avisar antes.
- NÃO executar ou sugerir comandos de instalação/infraestrutura a menos que solicitado.
- Restrições de Stack (Críticas):
  - NÃO utilizar enum, namespace ou parameter properties no TypeScript (regra erasableSyntaxOnly: true do TS 6).
  - NÃO otimizar componentes manualmente com useMemo/useCallback a não ser que estritamente necessário (React Compiler está ativo).
  - NÃO usar CSS Modules ou estilos globais que possam vazar para o host (usar estritamente Tailwind/Shadcn).
- Respeitar hierarquia de boas práticas: 1. Contratos de Arquitetura do Host/MFE; 2. Boas práticas do React 19/TS 6; 3. Boas práticas do Tailwind v4/Shadcn; 4. Clean Code. Sempre verificar o uso dessas boas práticas, a não ser que explicitamente justificado.

## Descrição

Este repositório é o **Core/Host** do ecossistema de Micro Frontends da Coelho Labs. Ele orquestra a "casca": layout global, slots de remotes, roteamento e tema. **Não contém regras de negócio** (planning poker, IA, backend FastAPI) — vivem em outros repositórios.

## Comandos

```bash
npm run dev              # servidor dev (Vite, porta 5173 por padrão)
npm run build            # tsc -b tsconfig.app.json tsconfig.node.json && vite build (typecheck faz parte do build)
npm run lint             # eslint .
npm run types            # typecheck do projeto da app
npm run preview          # servidor de produção (porta 4173)
npm run test             # Vitest (unitários + integração)
npm run test:watch       # Vitest em watch
npm run test:types       # typecheck dos testes (tsconfig.test.json)
npm run test:mutation    # Stryker incremental
npm run test:mutation:full # Stryker completo (--force)
```

- Verificação padrão de uma mudança: `npm run test && npm run test:types && npm run lint && npm run build`.

## Module Federation (não confunda!)

- O pacote instalado/configurado é **`@module-federation/vite`** (oficial). README e docs citam `@originjs/vite-plugin-federation` — **está desatualizado, ignore**. Não instale o `@originjs` para novas features. Versões: confie no `npm ls`.
- A config do federation fica em `module-federation.config.ts` (separada), importada pelo plugin `federation()` no `vite.config.ts`.
- **`module-federation.config.ts` exporta uma FUNÇÃO `mfConfig(env)`**, não um objeto estático. O `vite.config.ts` usa `defineConfig(({ mode }) => ...)` + `loadEnv(mode, process.cwd())` e injeta `mfConfig(env)` no `federation(...)`. Assim URLs de remote mudam por ambiente via `.env` (`VITE_*`), sem editar código. O `loadEnv` é importado SÓ no `vite.config.ts` — no `module-federation.config.ts` o `env` chega como parâmetro (importar lá dá `no-unused-vars`/`noUnusedLocals`).

### Remote (provider)

- Remotes registrados em `module-federation.config.ts`: **`planning-poker`** (dev `:4175`) e **`json-formatter`** (dev `:4177`). Cada um tem uma variável `VITE_*_ENTRY` própria em `.env.example`.
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

- **Use `loadRemote` de `@module-federation/runtime`** (dependência direta, pinada à versão que o plugin usa — confirme com `npm ls`) combinado com `React.lazy`:
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

### Requisitos no remote (repos com rota)

- `manifest: true` e `dts: true` explícitos.
- CORS: em dev o Vite já envia; em build/preview o servidor estático do remote precisa mandar `Access-Control-Allow-Origin` — sem CORS, `RUNTIME-001` / `Failed to get remoteEntry exports`.
- `server.origin` e `base` consistentes (dev: a porta do próprio remote; prod: domínio final).
- O `RemoteAppEntry` exposto NÃO deve montar seu próprio `<BrowserRouter>` — `react-router-dom` é singleton compartilhado e o host fornece o roteamento; exponha componentes/elementos de rota (sem router próprio).
- **NÃO renderize `<main>`** no RemoteAppEntry — o host já emite o landmark `<main>` do layout; dois `<main>` não-ocultos é HTML inválido. Use `<section>`/`<div>`.
- **Sem regras globais `body`/`#root`** no CSS do remote — vazam e brigam com o layout/background do host.
- **Tema:** o remote replica `src/index.css` do host (tokens oklch + `@custom-variant dark`) e o importa no `RemoteAppEntry` consumido (o host só recebe o CSS via o entry). Use `var(--token)` em vez de cores hardcoded e não redefina `:root`/`.dark` — o host controla o `.dark`.

### Troubleshooting (conhecidos)

- `RUNTIME-001` / `Failed to get remoteEntry exports` → CORS no remote ou URL errada; testar `curl http://localhost:4175/mf-manifest.json`.
- Remote não registra no primeiro load em dev → gotcha do plugin; fallback: `registerRemotes([{ name, type: "module", entry: import.meta.env.VITE_PLANNING_POKER_ENTRY }])` de `@module-federation/runtime` no início do `main.tsx`.
- `eslint` reclamando de `any` em `@mf-types/` → pasta gerada; já está nos `globalIgnores`.
- `tsconfig.tsbuildinfo` solto na raiz → artefato do `tsc -b`, já no `.gitignore` (`*.tsbuildinfo`).
- `shadcn add` criando pasta literal `@/` na raiz → faltam `compilerOptions.baseUrl`+`paths` no `tsconfig.json` raiz (ver seção de tsconfig).
- `<button>` dentro de `<button>` no ThemeToggle → o `Trigger` do Base UI renderiza `<button>`; use `render={<Button/>}` (ver seção UI/Design System).
- `react-refresh/only-export-components` em `src/components/ui/*` mesmo com `allowConstantExport` → normal no preset atual (`cva()` é `CallExpression`); a regra é `off` escopado a `ui/**` (ver seção lint).
- `react-hooks/set-state-in-effect` → derive o estado no render; `setState` síncrono em effect é erro. `setState` só em callback de subscription (padrão de referência: `use-theme.ts`).
- Testes aparecendo com erro/`any` na IDE → projeto inferido; garanta a referência a `tsconfig.test.json` na solution (`tsconfig.json`).
- Stryker listando apenas um arquivo no resumo → é o `clearTextReporter.skipFull: true`, que oculta arquivos com 100% dos mutantes mortos; o score agregado não muda.
- Mutation score abaixo do gate → investigue mutantes equivalentes antes de baixar o threshold (ver seção de mutation testing).
- Erro de render com remote resolvendo `null` gera `RuntimeError` no Stryker → capture com Error Boundary no teste para virar falha de asserção normal.

## Stack real (verifique, não confie no README)

- **React 19** (não 18), **react-router-dom v7**, **Vite 8**, **TypeScript ~6**.
- **`@module-federation/runtime`** é dependência direta (não só transitiva), pinada à versão que `@module-federation/vite` usa — garante UMA única instância do runtime entre plugin e `loadRemote`. Versões: `npm ls`.
- **Tailwind v4 + shadcn/ui instalados**. O visual usa tokens do design system — ver seções "UI / Design System" e "Tema". A Home é o catálogo de ferramentas do portal em Tailwind, com componentes de `src/components/ui/` e ícones `lucide-react`.
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

## Testes (padrão obrigatório — Context-Driven Testing / BDD)

Contrato de revisão para TODO teste novo (`*.test.ts`/`*.test.tsx`), unitário ou de integração. Vale para este repo e é o padrão a replicar nos demais MFEs. Não é sugestão de estilo.

### Estrutura obrigatória — describes aninhados Given/when/then

| Nível     | Bloco                              | Conteúdo permitido                                             |
| --------- | ---------------------------------- | -------------------------------------------------------------- |
| **Given** | `describe("Given …")`, o mais externo | só setup: dados base, mocks, `vi.mock`, stubs — no `beforeEach` |
| **When**  | `describe("when …")` aninhado no Given | só o gatilho: `render`, um clique, uma action do hook — no `beforeEach` |
| **Then**  | `it("then …")` dentro do When      | uma asserção; várias asserções sobre a mesma ação = vários `it` |

```tsx
describe("Given a valid JSON typed in the editor", () => {
  beforeEach(() => {
    /* dados base + mocks gerais */
  });

  describe("when the user clicks format", () => {
    beforeEach(async () => {
      /* um único gatilho */
    });

    it("then the output should be indented with two spaces", () => {
      /* uma asserção */
    });

    it("then the key order should be preserved", () => {
      /* outra asserção da MESMA ação */
    });
  });
});
```

- `beforeEach` **nunca** contém `expect`. Setup no Given, gatilho no When, verificação só no `it`.
- **Um gatilho por When** — dois cliques distintos = dois When, nunca dois `await` no mesmo `beforeEach`.
- **DRY por aninhamento**: vários When sob o mesmo Given; vários Then sob o mesmo When. O `beforeEach` externo roda antes do interno, então cada When herda o Given sem repetir setup.
- Prefixos literais e no caso exato: `Given` / `when` / `then`. Redação: `then` + sujeito + `should` (`then the output should …`, `then it should …`), nunca `then formats the json`.
- **Títulos 100% em inglês** — `describe` e `it`, sem pt-BR e sem acento. Queries por nome acessível continuam em pt-BR (`getByRole("button", { name: /formatar/i })`, porque a UI é pt-BR); mensagens de erro da UI são dados assertados, não títulos.
- Estado compartilhado: `let` no escopo do `describe`, atribuído no `beforeEach` (`strict` + `noUnusedLocals`).
- Testes refletem o **código atual**, não um layout-alvo: não escrever `then` para recurso inexistente na implementação.

### Escopo de cobertura

- **Fora (vendorizado/gerado)**: `src/components/ui/**` (CLI do shadcn sobre Base UI, sobrescrito pelo próximo `shadcn add`), `src/lib/utils.ts` (`cn`, scaffold), `src/index.css` (coberto por `diff` anti-drift), `src/test/*` (infra), configs.
- O `include` do Vitest já é `src/**/*.test.{ts,tsx}`: basta não criar arquivo de teste em `components/ui/` — nenhuma mudança de config é necessária para excluir.
- **Co-localizado**: `src/hooks/use-theme.ts`, `src/components/footer.test.tsx`, etc. `src/test/` guarda só infra, nunca testes. Só `*.test.ts(x)` roda no Vitest **e** entra em `npm run test:types`.
- `tsconfig.app.json` exclui `src/**/*.test.ts(x)` e `src/test/**`: o `tsc -b` do `npm run build` não compila testes nem exige `@types/node` no projeto da app. Os tipos dos testes são verificados por `npm run test:types` (`tsconfig.test.json`, com `types: ["vite/client", "node"]`).

### Infra de teste e fronteiras do browser

- `src/test/setup.ts`: `cleanup` + jest-dom; importa `src/test/jsdom-polyfills.ts`. Apenas `matchMedia` está ativo ali — `Range.prototype.getClientRects`/`getBoundingClientRect`, `Element.prototype.scrollIntoView` e `ResizeObserver` estão comentados; reative apenas se o componente sob teste exigir (Base UI `Select`/`Tooltip`, CodeMirror).
- O runner é `vitest.config.ts` com `globals: false` → importar `describe`/`it`/`expect`/`vi`/`beforeEach` de `"vitest"`. `clearMocks`/`restoreMocks`/`unstubGlobals`/`unstubEnvs` já estão ligados — stub de um teste não vaza para o próximo.
- Router em teste: `MemoryRouter` + `initialEntries` para páginas/componentes isolados. Exceção: o teste do `App` pode usar `BrowserRouter` porque o próprio `App` é dono do router; `RemoteAppEntry` é testado como contrato de rotas, sempre sob `MemoryRouter`.
- Módulos remotos: mocke `@module-federation/runtime` (`vi.mock` com `vi.hoisted`) em vez de depender de um remote em execução.
- Verificação de uma mudança: `npm run test` + `npm run test:types` (+ `npm run lint`/`npm run build` quando o teste alterar código).

| Fronteira                        | Existe no jsdom? | Como mockar                                                        |
| -------------------------------- | ---------------- | ------------------------------------------------------------------ |
| `matchMedia`                     | não              | stub com estado + listeners; cobrir `"change"` e cleanup           |
| `navigator.clipboard.writeText`  | não              | `vi.stubGlobal`/`defineProperty` + `vi.fn()`                        |
| `URL.createObjectURL`/`revoke…`  | não              | `vi.stubGlobal`; o `revoke` roda em `setTimeout(…, 0)`              |
| `DataTransfer` (drop de arquivo) | não              | `{ files: [file] }` + `fireEvent.drop(el, { dataTransfer })`        |
| `HTMLAnchorElement.click`        | sim              | `vi.spyOn` para provar o download sem navegar                       |
| timers                           | —                | `vi.useFakeTimers()` por When + `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` |

### Mutation testing (Stryker)

- Config em `stryker.config.json`; runner `vitest`; incremental por padrão. `npm run test:mutation:full` força a execução completa.
- Gate: `thresholds.break: 90` — score abaixo de 90 sai com código de erro. `high`/`low` só colorem o relatório.
- `clearTextReporter.skipFull: true` oculta do resumo os arquivos com 100% dos mutantes mortos; o score agregado continua correto. Os relatórios completos ficam em `reports/mutation/` (gitignored).
- Fora do `mutate`: testes, `src/test/**`, `src/components/ui/**` e `src/lib/utils.ts` (vendorizados/gerados). Não amplie o escopo de mutação para `ui/**` — o próximo `shadcn add` sobrescreve.
- Mutantes equivalentes são esperados (ex.: fallback `"system"` redundante e dependency array constante em `use-theme.ts`). Não baixe o gate nem adicione testes artificiais para eles; documente no `plan.md`.
- Erro de render com remote `null` vira `RuntimeError` no Stryker: use Error Boundary no teste para converter em falha de asserção normal.

## TypeScript / lint (armadilhas reais do tsconfig)

- `erasableSyntaxOnly: true` (TS 6): **proibido** `enum`, `namespace` e *parameter properties* (`constructor(private x)`) — use `union types`/objetos.
- `verbatimModuleSyntax: true`: use `import type` para importações somente de tipo.
- `allowImportingTsExtensions: true` + bundler mode: imports usam extensão explícita (ex: `./pages/home/Home.page.tsx`).
- `noUnusedLocals`/`noUnusedParameters` ativos.
- Projetos do `tsconfig.json` (solution): `tsconfig.app.json`, `tsconfig.node.json` e `tsconfig.test.json`. O `npm run build` roda `tsc -b tsconfig.app.json tsconfig.node.json`; os testes NÃO entram no projeto da app (excluídos por `tsconfig.app.json`) e são checados só por `npm run test:types` (`tsconfig.test.json`, com `types: ["vite/client", "node"]`).
- `eslint.config.js` (flat config): `react-refresh/only-export-components` é `off` APENAS em `src/components/ui/**`, num bloco **separado e DEPOIS** do bloco principal (ordem do array = precedência). Motivo: shadcn exporta consts de variantes via `cva(...)`; `allowConstantExport` do preset só cobre expressões literais — `CallExpression` (`cva`) não passa, então sem o escopo `off` o lint quebra em todo componente ui.
- `react-hooks/set-state-in-effect` (v7) ativo e é regra séria: derive estado no render; `setState` síncrono em effect quebra o lint.
- `globalIgnores` já cobre `dist`, `**/@mf-types/**`, `.mf-types`, `.dev-server`, `.stryker-tmp` e `reports`.

## Contrato arquitetural

- **Layout Core-driven** (`src/App.tsx`): header `sticky top-0 h-20` (marca + nav + `ThemeToggle`), `<main>` único com `max-w-7xl` (`flex-1`, `py-6`) contendo as `<Routes>`, e `<Footer />` ao final do fluxo. O wrapper é `flex flex-col min-h-screen` com tokens de tema.
- **Rotas**: `/` (Home), `/planning/*` (`planning-poker/RemoteAppEntry`) e `/json-formatter/*` (`json-formatter/RemoteAppEntry`). Cada rota remota fica em `Suspense` com fallback `Loading`.
- **Fallback de remote indisponível**: `loadRemote` pode resolver `null`; o `App` converte para um componente nulo via `mod?.default ?? ((): null => null)`. Não há Error Boundary de produção — um erro de rede do remote ainda pode borbulhar.
- **Sem regras de negócio no Host**: fluxos como criação de sala, votação e IA pertencem ao `planning-poker-mfe` / backend; o Host só fornece rota, layout e tema.

## Notas

- Backend FastAPI e demais serviços do ecossistema são privados e ficam em repositórios separados.
