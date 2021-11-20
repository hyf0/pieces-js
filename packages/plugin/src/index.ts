import { createUnplugin } from 'unplugin'
import { ParserOptions } from '@babel/core'

import { transformAndCollect } from './collect'
import { EnhancedNode } from './EnhancedNode'
import { pkgName } from './babel-plugin-pieces-collect'
import { caredExtRegExp, virtualPrefix } from './const'

export type PluginOptions = {
  /**
   * @description Customize babel parser plugins to support any syntax.
   */
  parserPlugins?: ParserOptions['plugins']
  generate?: {
    /**
     * @description informs bundler how to handle gennerated css file.
     * @default '.css'
     */
    ext?: string
  }
}

const piecesPlugin = createUnplugin<PluginOptions>((pluginOptions) => {
  const cssFileExt = pluginOptions?.generate?.ext ?? '.css'
  const hashToNodeMap = new Map<string, EnhancedNode>()

  return {
    name: '@pieces-js/plugin',
    transformInclude(id) {
      return caredExtRegExp.test(id)
    },
    resolveId(id) {
      return id.startsWith(virtualPrefix) ? id : null
    },
    async transform(inputCode, id) {
      if (!inputCode.includes(pkgName)) {
        return null
      }

      try {
        let { code, cssNodes } = await transformAndCollect(inputCode, id, {
          parserPlugins: pluginOptions?.parserPlugins,
        })

        for (const node of cssNodes) {
          hashToNodeMap.set(node.hash, node)
          code =
            `import '${virtualPrefix}/styles/id_${node.hash}_id${cssFileExt}';\n` +
            code
        }

        return {
          code: code,
          // map,
        }
      } catch (_err) {
        throw new Error(
          `Error ocurrs while collecting css\`...\` in file ${id}:\nPlease raise a issue in https://github.com/iheyunfei/pieces-js/issues.`
        )
      }
    },
    async load(id) {
      if (id.startsWith(virtualPrefix)) {
        const hash = id.match(/id_(.+)_id\./)?.[1]
        if (!hash) {
          throw new Error(
            `Unknown css file ${id}, Please raise a issue in https://github.com/iheyunfei/pieces-js/issues.`
          )
        }
        const node = hashToNodeMap.get(hash)
        if (!node) {
          throw new Error(
            `Node is not founded for hash ${hash}, Please raise a issue in https://github.com/iheyunfei/pieces-js/issues.`
          )
        }
        return node.gennerate()
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
