"use client";

import { useState } from "react";
import { inspections as syntheticInspections } from "../lib/data/inspections";
import AppShell from "../components/app-shell";

type ViewState = "loaded" | "loading" | "error" | "empty";

const VIEW_LABELS: Record<ViewState, string> = {
  loaded: "Con datos",
  loading: "Cargando",
  error: "Error",
  empty: "Vacío"
};

export default function HomePage() {
  const [view, setView] = useState<ViewState>("loaded");

  const inspections = view === "loaded" ? syntheticInspections : [];

  return (
    <AppShell>
      <header className="hero">
        <p className="eyebrow">Proyecto base · Semana 2</p>
        <h1>Inspecciones de laboratorio</h1>
        <p className="lead">
          Registro de mantenimiento para trabajar con conectividad intermitente.
          Los datos mostrados son sintéticos.
        </p>
        <span className="status">App shell instalable · estados de interfaz implementados</span>
      </header>

      <section aria-labelledby="inspections-heading" className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Datos de demostración</p>
            <h2 id="inspections-heading">Inspecciones recientes</h2>
          </div>
          <span className="count">{inspections.length} registros</span>
        </div>

        <div
          className="state-demo"
          role="group"
          aria-label="Simular estado de la interfaz (solo demostración)"
        >
          <span className="state-demo-label">Simular estado:</span>
          {(Object.keys(VIEW_LABELS) as ViewState[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`state-demo-button${view === option ? " is-active" : ""}`}
              aria-pressed={view === option}
              onClick={() => setView(option)}
            >
              {VIEW_LABELS[option]}
            </button>
          ))}
        </div>

        {view === "loading" && (
          <div className="state-panel state-loading" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <p>Cargando inspecciones…</p>
          </div>
        )}

        {view === "error" && (
          <div className="state-panel state-error" role="alert">
            <p className="state-title">No se pudieron cargar las inspecciones</p>
            <p className="muted">
              Hubo un problema de conexión intermitente. Verifica tu red e
              intenta de nuevo.
            </p>
            <button
              type="button"
              className="retry-button"
              onClick={() => setView("loaded")}
            >
              Reintentar
            </button>
          </div>
        )}

        {view === "empty" && (
          <div className="state-panel state-empty">
            <p className="state-title">Aún no hay inspecciones registradas</p>
            <p className="muted">
              Cuando se capture una inspección sintética, aparecerá aquí.
            </p>
          </div>
        )}

        {view === "loaded" && (
          <div className="inspection-grid">
            {inspections.map((inspection) => (
              <article className="inspection-card" key={inspection.id}>
                <div className="card-topline">
                  <span className={`badge badge-${inspection.status}`}>
                    {inspection.statusLabel}
                  </span>
                  <span className="muted">{inspection.date}</span>
                </div>
                <h3>{inspection.location}</h3>
                <p>{inspection.summary}</p>
                <dl>
                  <div>
                    <dt>Responsable</dt>
                    <dd>{inspection.inspector}</dd>
                  </div>
                  <div>
                    <dt>Hallazgos</dt>
                    <dd>{inspection.findings}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
