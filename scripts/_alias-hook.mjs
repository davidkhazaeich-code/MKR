// Permet a Node d'executer directement les modules du projet, qui sont ecrits
// pour le bundler Next : imports en « @/… » (alias tsconfig), sans extension, et
// import de JSON sans attribut de type. Utilise seulement par `scripts/`.
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

const SRC = resolvePath(dirname(fileURLToPath(import.meta.url)), '..', 'src')

function withExtension(base) {
  for (const ext of ['', '.ts', '.tsx', '.mts', '/index.ts']) {
    if (existsSync(base + ext)) return base + ext
  }
  return null
}

/** Next accepte `import x from './y.json'` ; Node exige l'attribut de type. */
function tagJson(result, context) {
  if (result?.url?.endsWith('.json')) {
    return { ...result, importAttributes: { ...context.importAttributes, type: 'json' } }
  }
  return result
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const file = withExtension(resolvePath(SRC, specifier.slice(2)))
      if (file) {
        const url = pathToFileURL(file).href
        return tagJson({ url, shortCircuit: true }, context)
      }
    }
    return tagJson(nextResolve(specifier, context), context)
  },
})
