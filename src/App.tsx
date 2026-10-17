import { Suspense, lazy, type ComponentType } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { loadRemote } from "@module-federation/runtime";
import Home from "./pages/home/Home.page.tsx";
import { ThemeToggle } from "./components/theme-toggle.tsx";
import { Loading } from "./components/loading.tsx";

const PlanningPoker = lazy(() =>
  loadRemote<{ default: ComponentType }>("planning-poker/RemoteAppEntry").then(
    (mod) => ({
      default: mod?.default ?? (((): null => null) as ComponentType),
    }),
  ),
);

const AdSlot = lazy(() =>
  loadRemote<{ default: ComponentType<{ side: string }> }>(
    "content-delivery/AdBannerLateral",
  ).then((mod) => ({
    default: mod?.default ?? (((): null => null) as ComponentType),
  })),
);

const LoadingPlus = lazy(() =>
  loadRemote<{ default: ComponentType }>("content-delivery/LoadingPlus").then(
    (mod) => ({
      default: mod?.default ?? (((): null => null) as ComponentType),
    }),
  ),
);

const JSONFormatter = lazy(() =>
  loadRemote<{ default: ComponentType }>("json-formatter/RemoteAppEntry").then(
    (mod) => ({
      default: mod?.default ?? (((): null => null) as ComponentType),
    }),
  ),
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell flex min-h-svh flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 h-20 bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4">
            <Link to="/" className="text-base font-semibold">
              Inicio
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link
                to="/planning"
                className="rounded-md px-2 py-1 transition-colors hover:bg-accent"
              >
                Planning Poker
              </Link>
              <Link
                to="/json-formatter"
                className="rounded-md px-2 py-1 transition-colors hover:bg-accent"
              >
                Formatador JSON
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </header>

        <div className="px-8 portal-shell-grid w-full flex-1 min-h-0 lg:min-h-[calc(100svh-5rem)] py-4">
          <div className="portal-shell-rail">
            <AdSlot side="esquerdo" />
          </div>
          <main className="relative flex flex-col min-w-0 w-full max-w-9xl mx-auto">
            <div className="flex-1 min-h-0">
              <Routes>
                <Route index element={<Home />} />
                <Route
                  path="/planning/*"
                  element={
                    <Suspense
                      fallback={
                        <Loading>
                          <div className="p-4 text-muted-foreground">
                            Carregando Planning Poker...
                          </div>
                        </Loading>
                      }
                    >
                      <div className="w-full h-full animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                        <PlanningPoker />
                      </div>
                    </Suspense>
                  }
                />
                <Route
                  path="/json-formatter/*"
                  element={
                    <Suspense
                      fallback={
                        <Loading>
                          <div className="p-4 text-muted-foreground">
                            Carregando Formatador e Validador JSON...
                          </div>
                        </Loading>
                      }
                    >
                      <div className="w-full h-full animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                        <JSONFormatter />
                      </div>
                    </Suspense>
                  }
                />
              </Routes>
              <LoadingPlus />
            </div>
            <footer className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between mt-auto px-5 py-6 gap-2 text-sm text-muted-foreground sm:flex-row">
              <p>
                Desenvolvido por{" "}
                <span className="font-medium text-foreground">
                  Herivelton Coelho
                </span>
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/coelho-labs"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-foreground hover:underline underline-offset-4"
                >
                  Coelho Labs no GitHub
                </a>
                <span aria-hidden="true" className="text-muted-foreground/50">
                  ·
                </span>
                <a
                  href="https://github.com/hericoelho"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-foreground hover:underline underline-offset-4"
                >
                  GitHub de Herivelton Coelho
                </a>
              </div>
            </footer>
          </main>
          <div className="portal-shell-rail">
            <AdSlot side="direito" />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
