import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
const sourceRoot = new URL('../', import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/') || (specifier.startsWith('.') && !context.parentURL?.includes('/node_modules/'))) {
      const url = specifier.startsWith('@/') ? new URL(specifier.slice(2), sourceRoot) : new URL(specifier, context.parentURL);
      for (const extension of ['', '.ts', '.tsx']) {
        const candidate = fileURLToPath(url) + extension;
        if (existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (/\.tsx?$/.test(url) && !url.includes('/node_modules/')) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
      }).outputText;
      return { format: 'commonjs', source, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
