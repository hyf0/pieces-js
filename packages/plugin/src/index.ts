import { createUnplugin } from 'unplugin'
import { AtRule, Declaration, Rule, stringify } from 'postcss';
import { transformAndCollect } from './babel-collect-plugin'
import { getUniqueId } from './helper';

const hashToNodeMap = new Map<string, (AtRule | Rule | Declaration)>()

const virtualPrefix = 'virtual-pieces-js'

export const unplugin = createUnplugin(() => {
  return {
    name: 'pieces',
    enforce: 'pre',
    transformInclude (id) {
      return ['.ts', 'tsx', '.js', '.jsx'].some(ext => id.endsWith(ext))
    },
    resolveId(id) {
      if (id.startsWith(virtualPrefix)) {
        return id
      }
    },
    // just like rollup transform
    transform (code, id) {
    let { codes: outputCodes, cssNodes } = transformAndCollect(code, id);

    if (cssNodes.length === 0) {
    } else {
      cssNodes.map(node => {
        const hash = getUniqueId(node.toString(stringify))
        hashToNodeMap.set(hash, node)
        outputCodes += `\n;import '${virtualPrefix}/${hash}.css';`;
      })
    }

    return outputCodes
    
    },
    async load(id) {
      if (id.startsWith(virtualPrefix)) {
        const hash = id.slice(id.indexOf('/') + 1, id.indexOf('.css'))
        const node = hashToNodeMap.get(hash);
        return node!.toString(stringify)
      }
      return null
    }
  }
})

export const vitePlugin = unplugin.vite
export const rollupPlugin = unplugin.rollup
export const webpackPlugin = unplugin.webpack