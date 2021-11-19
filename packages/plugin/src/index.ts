import { createUnplugin } from 'unplugin'
import { collect } from './collect'
import { EnhancedNode } from './types'
import { pkgName } from './babel-plugin-pieces-collect'
import { virtualPrefix } from './const'

export type PluginOptions = {
  generate?: {
    ext?: string
  }
}

const piecesPlugin = createUnplugin<PluginOptions>((pluginOptions) => {
  const cssFileExt = pluginOptions?.generate?.ext ?? '.css'
  const hashToNodeMap = new Map<string, EnhancedNode>()

  return {
    name: '@pieces-js/plugin',
    transformInclude(id) {
      return /\.(ts|tsx|js|jsx|vue|svelte)$/.test(id)
    },
    resolveId(id) {
      if (id.startsWith(virtualPrefix)) {
        return id
      }
    },
    async transform(code, id) {
      if (!code.includes(pkgName)) {
        return null
      }

      try {
        let { code: outputCode, cssNodes } = await collect(code, id)

        for (const node of cssNodes) {
          hashToNodeMap.set(node.hash, node)
          outputCode =
            `import '${virtualPrefix}/styles/id_${node.hash}_id${cssFileExt}';\n` +
            outputCode
        }

        return outputCode
      } catch (_err) {
        throw new Error(
          `Error ocurrs while collecting css\`...\` in file ${id}:\nPlease raise a issue in https://github.com/iheyunfei/pieces-js/issues.`
        )
      }
    },
    async load(id) {
      if (id.startsWith(virtualPrefix)) {
        const hash = id.match(/id_(.+)_id/)?.[1]
        if (!hash) {
          throw new Error(
            `Unexpected imported file ${id}, Please raise a issue in https://github.com/iheyunfei/pieces-js/issues.`
          )
        }
        const node = hashToNodeMap.get(hash)
        if (!node) {
          throw new Error(
            `Node not founded for hash ${hash}, Please raise a issue in https://github.com/iheyunfei/pieces-js/issues.`
          )
        }
        return node.node.toString()
      }
      return null
    },
  }
})

/**
 * @description usage
 * ```ts
 * // next.config.js
const piecesJs = require('@pieces-js/plugin')

module.exports = piecesJs.next({
  // plugin options
})({
  // next options
})
 * ```
 */
const next =
  (pluginOptions: PluginOptions) =>
  (nextConfig: any): any => {
    return Object.assign({}, nextConfig, {
      webpack(config: any, options: any) {
        config.plugins.push(piecesPlugin.webpack(pluginOptions))

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      },
    })
  }

export default {
  ...piecesPlugin,
  next,
}
export const vitePlugin = piecesPlugin.vite
export const rollupPlugin = piecesPlugin.rollup
export const webpackPlugin = piecesPlugin.webpack
