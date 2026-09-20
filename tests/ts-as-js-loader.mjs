// tests/ts-as-js-loader.mjs
//
// Nuestros archivos tests/*.spec.ts NO usan sintaxis real de TypeScript
// (sin anotaciones de tipo): son JavaScript válido con extensión .ts, tal
// como lo pide la actividad. Por defecto, Node rechaza cargar archivos con
// extensión ".ts" (extensión no reconocida), sin importar si su contenido
// ya es JS puro.
//
// Este "loader" de módulos ESM le dice a Node: "cuando encuentres un
// archivo .ts, trátalo como un módulo JavaScript normal". Usa la API
// pública y estable de loaders de Node (disponible desde Node 12.11+),
// por lo que funciona igual en Node 18, 20 y 22 — a diferencia del flag
// --experimental-strip-types, que solo existe desde Node 22.6+.
//
// No transforma ni elimina tipos: solo cambia cómo Node clasifica el
// archivo antes de ejecutarlo.

export async function load(url, context, nextLoad) {
  // Se ignora cualquier query string (p. ej. "?bust=123", usado en las
  // pruebas para forzar una recarga del módulo) antes de revisar la
  // extensión, para que también se reconozcan como .ts esas URLs.
  const pathWithoutQuery = url.split("?")[0];
  if (pathWithoutQuery.endsWith(".ts")) {
    return nextLoad(url, { ...context, format: "module" });
  }
  return nextLoad(url, context);
}
