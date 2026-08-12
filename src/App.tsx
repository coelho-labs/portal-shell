import { Suspense, lazy, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { loadRemote } from '@module-federation/runtime';
import Home from './pages/home/Home.page.tsx';

const PlanningPoker = lazy(() =>
  loadRemote<{ default: ComponentType }>('planning-poker/RemoteAppEntry').then(
    (mod) => ({ default: mod?.default ?? ((): null => null) as ComponentType }),
  ),
);

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <h1>Aplication Main (Host)</h1>

        <nav style={{ marginBottom: '20px' }}>
          <Link to="/">Home do Host</Link> |{' '}
          <Link to="/planning">Planning Poker (remote)</Link>
        </nav>

        <div>
          <Routes>
            <Route index element={<Home />} />
            <Route
              path="/planning/*"
              element={
                <Suspense fallback={<div>Carregando planning-poker...</div>}>
                  <PlanningPoker />
                </Suspense>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
