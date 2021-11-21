import * as babel from '@babel/core'
import { ParserOptions } from '@babel/core'
import babelPluginPiecesCollect from './babel-plugin-pieces-collect'
import { WithPiecesMetadata } from './babel-plugin-pieces-collect'

export const transformAndCollect = async (inputCode: string, id: string, options?: {
  parserPlugins?: ParserOptions['plugins']
}) => {
  const transformOptions = resolveTransfromOptionsById(id)

  transformOptions.parserOpts?.plugins?.push(...(options?.parserPlugins ?? []))

  const result = await babel.transformAsync(inputCode, transformOptions)
  const { metadata, code: code, map } = result!
  const {
    pieces: { cssNodes },
  } = metadata! as WithPiecesMetadata
  return {
    code: code ?? inputCode,
    cssNodes,
    map,
  }
}


const resolveTransfromOptionsById = (id: string): babel.TransformOptions => {
  const parserPlugins: ParserOptions['plugins'] = [
    'topLevelAwait',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'importMeta',
  ]

  if (!id.endsWith('.ts')) {
    parserPlugins.push('jsx')
  }

  if (/\.tsx?$/.test(id)) {
    parserPlugins.push('typescript')
  }

  return {
    filename: id,
    plugins: [babelPluginPiecesCollect],
    parserOpts: {
      plugins: [...parserPlugins],
    },
    babelrc: false,
    configFile: false,
    sourceMaps: true,
  }
}