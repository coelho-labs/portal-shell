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
      <div className="flex flex-col w-full min-h-screen bg-background text-foreground antialiased">
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

        <main className="flex flex-1 flex-col w-full max-w-7xl mx-auto sm:px-6 md:px-8 py-6">
          <Routes>
            <Route
              index
              element={
                <Suspense
                  fallback={
                    <Loading>
                      <div className="p-4 text-muted-foreground">
                        Carregando pagina inicial...
                      </div>
                    </Loading>
                  }
                >
                  <div className="flex flex-1 flex-col w-full animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                    <Home />
                  </div>
                </Suspense>
              }
            />
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
                  <div className="flex flex-1 flex-col w-full animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
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
                  <div className="flex flex-1 flex-col w-full animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                    <JSONFormatter />
                  </div>
                </Suspense>
              }
            />
          </Routes>
        </main>
        <footer className="flex flex-col w-full max-w-7xl mx-auto items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 md:px-8">
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
      </div>
    </BrowserRouter>
  );
}
