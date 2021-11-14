import { createUnplugin } from 'unplugin'
import { AtRule, Declaration, Rule, stringify } from 'postcss';
import { transformAndCollect } from './babel-collect-plugin'
import { getUniqueId } from './helper';

const hashToNodeMap = new Map<string, (AtRule | Rule | Declaration)>()

const virtualPrefix = 'virtual-pieces-js'

const piecesPlugin = createUnplugin<{
  generate?: {
    ext?: string,
  }
}>((pluginOptions) => {
  return {
    name: '@pieces-js/plugin',
    enforce: 'pre',
    transformInclude (id) {
      return ['.ts', 'tsx', '.js', '.jsx'].some(ext => id.endsWith(ext))
    },
    resolveId(id) {
      if (id.startsWith(virtualPrefix)) {
        return id
      }
    },
    async transform (code, id) {
      const ext = pluginOptions?.generate?.ext ?? '.css'
      let { codes: outputCodes, cssNodes } = await transformAndCollect(code, id)
        
      cssNodes.forEach(node => {
        const hash = getUniqueId(node.toString(stringify))
        hashToNodeMap.set(hash, node)
        outputCodes += `\n;import '${virtualPrefix}/${hash}${ext}';`;
      })

      return outputCodes
    },
    async load(id) {
      if (id.startsWith(virtualPrefix)) {
        const ext = pluginOptions?.generate?.ext ?? '.css'
        const hash = id.slice(id.indexOf('/') + 1, id.indexOf(ext))
        const node = hashToNodeMap.get(hash);
        return node!.toString(stringify)
      }
      return null
    }
  }
})

export default piecesPlugin
export const vitePlugin = piecesPlugin.vite
export const rollupPlugin = piecesPlugin.rollup
export const webpackPlugin = piecesPlugin.webpack