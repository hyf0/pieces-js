import * as babel from '@babel/core'
import { ParserOptions } from '@babel/core'
import { WithPiecesMetadata } from './babel-plugin-pieces-collect'

export const collect = async (code: string, id: string) => {
  
  const transformOptions = resolveTransfromOptionsById(id)

  const { code: transformedCode, cssNodes  } = await transform(code, transformOptions)

  return {
    code: transformedCode,
    cssNodes,
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
    //@ts-ignore
    plugins: [require.resolve('./babel-plugin-pieces-collect')],
    parserOpts: {
      plugins: [...parserPlugins],
    },
    babelrc: false,
    configFile: false,
    sourceMaps: true,
  }
}

export const transform = async (code: string, options: babel.TransformOptions) => {
  const result = await babel.transformAsync(code, options)
  const { metadata, code: transformedCodes } = result!
  const {
    pieces: { cssNodes },
  } = metadata! as WithPiecesMetadata
  return {
    code: transformedCodes ?? code,
    cssNodes,
  }
}
