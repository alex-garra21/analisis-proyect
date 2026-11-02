import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      <footer className="footer-bar">
        <span className="footer-logo">COMERCIAL FLORES DEL CAMPO</span>
        <span className="footer-copy">© 2026 Proyecto Analisis de Sistemas UMG - Steven Reyes</span>
      </footer>
    </div>
  );
}