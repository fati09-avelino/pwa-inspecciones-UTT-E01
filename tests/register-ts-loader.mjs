// tests/register-ts-loader.mjs
//
// Registra el loader de tests/ts-as-js-loader.mjs usando la API pública y
// estable module.register() (disponible desde Node 20.6+ y Node 18.19+),
// que es la forma recomendada actual y no emite advertencias de
// obsolescencia como --experimental-loader.
import { register } from "node:module";

register("./ts-as-js-loader.mjs", import.meta.url);
