import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

/**
 * App Shell de la PWA de inspecciones.
 *
 * Provee el "chrome" persistente de la aplicación: enlace de salto,
 * encabezado con navegación accesible por teclado y pie de página.
 * El contenido variable (incluyendo los estados de carga/error/vacío)
 * se recibe como children y se renderiza dentro del landmark <main>.
 */
export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>

      <header className="app-header">
        <div className="app-header-inner">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true">
              🧪
            </span>
            Inspecciones UTT
          </span>

          <nav aria-label="Navegación principal" className="app-nav">
            <a href="#main-content">Inicio</a>
            <a href="#inspections-heading">Inspecciones</a>
            <a href="#app-footer">Acerca de</a>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="app-main">
        {children}
      </main>

      <footer id="app-footer" className="app-footer">
        <p>Aplicaciones Web Progresivas · Universidad Tecnológica de Tehuacán</p>
        <p className="muted">
          App shell instalable · datos sintéticos · Semana 2
        </p>
      </footer>
    </div>
  );
}
