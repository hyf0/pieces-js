import { createUnplugin } from 'unplugin'
import { stringify } from 'postcss'
import { collect } from './collect'
import { EnhancedNode } from './types'
import { pkgName } from './babel-plugin-pieces-collect'

const hashToNodeMap = new Map<string, EnhancedNode>()

const virtualPrefix = 'virtual-pieces-js'

type PluginOptions = {
  generate?: {
    ext?: string
  }
}

const piecesPlugin = createUnplugin<PluginOptions>((pluginOptions) => {
  return {
    name: '@pieces-js/plugin',
    transformInclude(id) {
      return ['.ts', 'tsx', '.js', '.jsx', '.vue', '.svelte'].some((ext) =>
      id.endsWith(ext)
      )
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
        let { code: outputCode, cssNodes } = await collect(
          code,
          id
        )

        const ext = pluginOptions?.generate?.ext ?? '.css'

        cssNodes.forEach((node) => {
          hashToNodeMap.set(node.hash, node)
          outputCode += `\n;import '${virtualPrefix}/id_${node.hash}${ext}';`
        })

        return outputCode
      } catch (err) {
        console.error(`Error occurs in file ${id}:\n`, code)
        // TODO: better error report
        throw err
      }
    },
    async load(id) {
      if (id.startsWith(virtualPrefix)) {
        const ext = pluginOptions?.generate?.ext ?? '.css'
        const hash = id.slice(
          id.indexOf('id_') + 'id_'.length,
          id.indexOf(`${ext}`)
        )
        const node = hashToNodeMap.get(hash)
        return node!.node.toString(stringify)
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
