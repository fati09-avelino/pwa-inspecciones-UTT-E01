// tests/rendering.spec.ts
//
// Pruebas de COMPORTAMIENTO del renderizado de la Semana 4:
//  - Ruta SSR (/inspecciones/[id]): el HTML que produce el servidor YA trae
//    los datos, sin necesidad de JavaScript en el navegador.
//  - Ruta CSR (/inspecciones): el HTML inicial solo trae el estado de carga;
//    los datos llegan después, desde el navegador.
//  - Estados de la vista (carga, error, vacío, con datos) y filtro interactivo.
//  - Archivos loading.tsx / error.tsx conectados con el componente de carga.
//
// Se renderiza con react-dom/server (sin navegador ni dependencias nuevas). Los
// archivos .tsx se cargan con tests/ts-as-js-loader.mjs. Todos los datos son
// sintéticos y las pruebas no dependen del reloj ni de la red (latencia = 0).

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = (relativePath) => import(pathToFileURL(path.join(ROOT, relativePath)).href);

const { inspections } = await load("src/lib/data/inspections.ts");
const service = await load("src/lib/data/inspections-service.ts");
const view = await load("src/components/inspections-view.tsx");
const LoadingState = (await load("src/components/loading-state.tsx")).default;
const CsrListPage = (await load("src/app/inspecciones/page.tsx")).default;
const SsrDetailPage = (await load("src/app/inspecciones/[id]/page.tsx")).default;
const RouteLoading = (await load("src/app/inspecciones/[id]/loading.tsx")).default;
const RouteError = (await load("src/app/inspecciones/[id]/error.tsx")).default;

const InspectionsView = view.default;
const { filterInspections } = view;

const LAB = Object.fromEntries(inspections.map((i) => [i.id, i.laboratory]));

const html = (element) => renderToStaticMarkup(element);
const renderView = (props) =>
  html(React.createElement(InspectionsView, { filter: "todas", ...props }));

// Recorre un árbol de elementos React ya construido y devuelve los que cumplen
// la condición (sirve para "pulsar" botones sin necesitar un navegador).
function findAll(node, predicate, found = []) {
  if (node === null || node === undefined || typeof node === "boolean") return found;
  if (Array.isArray(node)) {
    node.forEach((child) => findAll(child, predicate, found));
    return found;
  }
  if (typeof node === "object" && node.props) {
    if (predicate(node)) found.push(node);
    findAll(node.props.children, predicate, found);
  }
  return found;
}
const textOf = (node) =>
  typeof node === "string" || typeof node === "number"
    ? String(node)
    : Array.isArray(node)
      ? node.map(textOf).join("")
      : node && node.props
        ? textOf(node.props.children)
        : "";
const buttonWithText = (tree, text) =>
  findAll(tree, (n) => n.type === "button" && textOf(n).trim() === text)[0];

// ---------- Lógica del filtro ----------

test("filtro: 'todas' devuelve todos los registros y cada estado devuelve solo los suyos", () => {
  assert.equal(filterInspections(inspections, "todas").length, inspections.length);
  assert.deepEqual(
    filterInspections(inspections, "Completada").map((i) => i.id),
    ["INS-002"]
  );
  assert.deepEqual(
    filterInspections(inspections, "En revisión").map((i) => i.id),
    ["INS-003"]
  );
});

// ---------- Ruta CSR: /inspecciones ----------

test("CSR: el HTML inicial del servidor trae solo el estado de carga, sin datos", () => {
  const serverHtml = renderToString(React.createElement(CsrListPage));

  assert.match(serverHtml, /Cargando/);
  assert.match(serverHtml, /role="status"/);
  for (const laboratory of Object.values(LAB)) {
    assert.ok(
      !serverHtml.includes(laboratory),
      `"${laboratory}" no debe venir en el HTML del servidor: en CSR los datos llegan desde el navegador`
    );
  }
});

test("CSR: la capa de datos entrega las inspecciones de forma asíncrona", async () => {
  const promise = service.fetchInspections(0);
  assert.ok(promise instanceof Promise, "fetchInspections debe ser asíncrona");
  const items = await promise;
  assert.equal(items.length, inspections.length);
});

test("vista: estado de carga muestra el indicador accesible y ningún registro", () => {
  const markup = renderView({ state: { kind: "loading" } });
  assert.match(markup, /role="status"/);
  assert.match(markup, /Cargando/);
  assert.ok(!markup.includes(LAB["INS-001"]));
});

test("vista: estado de error muestra alerta con botón de reintento", () => {
  const markup = renderView({ state: { kind: "error", message: "Falla de red simulada" } });
  assert.match(markup, /role="alert"/);
  assert.match(markup, /Falla de red simulada/);
  assert.match(markup, /Reintentar/);
});

test("vista: el botón Reintentar realmente llama a onRetry", () => {
  let retries = 0;
  const tree = InspectionsView({
    state: { kind: "error", message: "x" },
    filter: "todas",
    onRetry: () => retries++
  });
  buttonWithText(tree, "Reintentar").props.onClick();
  assert.equal(retries, 1);
});

test("vista: estado vacío muestra mensaje y no inventa registros", () => {
  const markup = renderView({ state: { kind: "ready", items: [] } });
  assert.match(markup, /No hay inspecciones para mostrar/);
  assert.ok(!markup.includes("Ver Detalle"));
});

test("vista: con datos lista todos los registros con su enlace al detalle", () => {
  const markup = renderView({ state: { kind: "ready", items: inspections } });
  for (const inspection of inspections) {
    assert.ok(markup.includes(inspection.laboratory));
    assert.ok(markup.includes(`href="/inspecciones/${inspection.id}"`));
  }
});

test("vista: filtrar por 'Completada' muestra solo ese registro", () => {
  const markup = renderView({ state: { kind: "ready", items: inspections }, filter: "Completada" });
  assert.ok(markup.includes(LAB["INS-002"]));
  assert.ok(!markup.includes(LAB["INS-001"]));
  assert.ok(!markup.includes(LAB["INS-003"]));
});

test("vista: los botones del filtro llaman a onFilterChange con el valor correcto", () => {
  const received = [];
  const tree = InspectionsView({
    state: { kind: "ready", items: inspections },
    filter: "todas",
    onFilterChange: (value) => received.push(value)
  });
  buttonWithText(tree, "Completada").props.onClick();
  buttonWithText(tree, "Pendiente").props.onClick();
  assert.deepEqual(received, ["Completada", "Pendiente"]);
});

// ---------- Ruta SSR: /inspecciones/[id] ----------

test("SSR: el HTML del servidor del detalle ya incluye los datos de la inspección", async () => {
  const element = await SsrDetailPage({ params: { id: "INS-002" } });
  const markup = html(element);
  const inspection = inspections.find((i) => i.id === "INS-002");

  assert.ok(markup.includes(inspection.laboratory));
  assert.ok(markup.includes(inspection.findings));
  assert.ok(markup.includes(inspection.location));
  assert.match(markup, /href="\/inspecciones"/);
});

test("SSR: un id inexistente muestra 'no encontrada' y un enlace de regreso", async () => {
  const element = await SsrDetailPage({ params: { id: "INS-999" } });
  const markup = html(element);

  assert.match(markup, /no encontrada/);
  assert.ok(markup.includes("INS-999"));
  assert.match(markup, /href="\/inspecciones"/);
  assert.ok(!markup.includes(LAB["INS-001"]), "no debe mostrar datos de otra inspección");
});

// ---------- Estados de la ruta (loading.tsx / error.tsx) ----------

test("loading.tsx reutiliza el componente de carga accesible", () => {
  const markup = html(React.createElement(RouteLoading));
  assert.equal(markup, html(React.createElement(LoadingState)));
  assert.match(markup, /role="status"/);
});

test("error.tsx muestra alerta y el botón Reintentar llama a reset()", () => {
  let resets = 0;
  const element = RouteError({ error: new Error("fallo simulado"), reset: () => resets++ });
  assert.match(html(element), /role="alert"/);
  buttonWithText(element, "Reintentar").props.onClick();
  assert.equal(resets, 1);
});
