import { Suspense, lazy, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { loadRemote } from '@module-federation/runtime';
import Home from './pages/home/Home.page.tsx';
import { ThemeToggle } from './components/theme-toggle.tsx';

const PlanningPoker = lazy(() =>
  loadRemote<{ default: ComponentType }>('planning-poker/RemoteAppEntry').then(
    (mod) => ({ default: mod?.default ?? ((): null => null) as ComponentType }),
  ),
);

function AdSlot({ side }: { side: 'esquerdo' | 'direito' }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 flex h-[calc(100svh-5rem)] items-center justify-center rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Ad slot {side} — remote AdSense
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 h-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4">
            <Link to="/" className="text-base font-semibold">
              Coelho Labs · Portal
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="rounded-md px-2 py-1 transition-colors hover:bg-accent">
                Home
              </Link>
              <Link
                to="/planning"
                className="rounded-md px-2 py-1 transition-colors hover:bg-accent"
              >
                Planning Poker
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[200px_1fr_200px]">
          <AdSlot side="esquerdo" />
          <main className="min-w-0">
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
            </Routes>
          </main>
          <AdSlot side="direito" />
        </div>
      </div>
    </BrowserRouter>
  );
}
