// tests/ts-as-js-loader.mjs
//
// Loader de módulos ESM para las pruebas. Permite que Node ejecute archivos
// .ts y .tsx del proyecto SIN instalar dependencias nuevas ni usar flags
// experimentales (--experimental-strip-types solo existe en Node 22.6+):
//
//  1. Los archivos .ts/.tsx se transpilan a JavaScript con el paquete
//     "typescript" (ya es devDependency del proyecto). Es solo transpilación:
//     no se hace revisión de tipos (eso lo hace "next build").
//  2. Se resuelve el alias "@/..." -> "src/..." definido en tsconfig.json y
//     los imports sin extensión (p. ej. "../components/x" -> x.tsx).
//  3. Los imports de subrutas de paquetes sin extensión (p. ej. "next/link")
//     se resuelven agregando ".js", como hace un bundler.
//
// Los archivos tests/*.spec.ts son JavaScript válido con extensión .ts (tal
// como pide la actividad); la transpilación los deja funcionalmente iguales.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANDIDATE_EXTENSIONS = [".ts", ".tsx", "/index.ts", "/index.tsx"];

function stripQuery(url) {
  return url.split("?")[0];
}

function tryFile(basePath) {
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) return basePath;
  for (const ext of CANDIDATE_EXTENSIONS) {
    const candidate = basePath + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  // Alias "@/..." -> "<raíz>/src/..."
  if (specifier.startsWith("@/")) {
    const found = tryFile(path.join(ROOT, "src", specifier.slice(2)));
    if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
  }

  // Imports relativos sin extensión hacia archivos .ts/.tsx
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
    const parentDir = path.dirname(fileURLToPath(stripQuery(context.parentURL)));
    const target = path.resolve(parentDir, specifier);
    if (!path.extname(target)) {
      const found = tryFile(target);
      if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
    }
  }

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    // Subrutas de paquetes sin "exports" (p. ej. "next/link") requieren ".js"
    const isBare = !specifier.startsWith(".") && !specifier.startsWith("/") && !specifier.includes(":");
    if (isBare && !path.extname(specifier) && error && error.code === "ERR_MODULE_NOT_FOUND") {
      return nextResolve(specifier + ".js", context);
    }
    throw error;
  }
}

export async function load(url, context, nextLoad) {
  const cleanUrl = stripQuery(url);
  if (cleanUrl.endsWith(".ts") || cleanUrl.endsWith(".tsx")) {
    const source = fs.readFileSync(fileURLToPath(cleanUrl), "utf-8");
    const { outputText } = ts.transpileModule(source, {
      fileName: fileURLToPath(cleanUrl),
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true
      }
    });
    return { format: "module", source: outputText, shortCircuit: true };
  }
  return nextLoad(url, context);
}
