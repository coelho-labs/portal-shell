import { Suspense, lazy, type ComponentType } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { loadRemote } from "@module-federation/runtime";
import Home from "./pages/home/Home.page.tsx";
import { ThemeToggle } from "./components/theme-toggle.tsx";

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
                to="/"
                className="rounded-md px-2 py-1 transition-colors hover:bg-accent"
              >
                Inicio
              </Link>
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

        <div className="px-8 portal-shell-grid w-full flex-1 py-4">
          <div className="portal-shell-rail">
            <AdSlot side="esquerdo" />
          </div>
          <main className="relative min-h-100 min-w-0 w-full max-w-9xl mx-auto">
            <Routes>
              <Route index element={<Home />} />
              <Route
                path="/planning/*"
                element={
                  <Suspense
                    fallback={
                      <div className="p-4 text-muted-foreground">
                        Carregando planning-poker...
                      </div>
                    }
                  >
                    <PlanningPoker />
                  </Suspense>
                }
              />
              <Route
                path="/json-formatter/*"
                element={
                  <Suspense
                    fallback={
                      <div className="p-4 text-muted-foreground">
                        Carregando json-formatter...
                      </div>
                    }
                  >
                    <JSONFormatter />
                  </Suspense>
                }
              />
            </Routes>
            <LoadingPlus />
          </main>
          <div className="portal-shell-rail">
            <AdSlot side="direito" />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
