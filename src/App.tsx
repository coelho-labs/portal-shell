import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home/Home.page.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <h1>Aplication Main (Host)</h1>
        
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/">Home do Host</Link> |{' '}
        </nav>

        <div>
          <Routes>
            {/* Rota nativa do Host */}
            <Route index element={<Home />} /> 
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
