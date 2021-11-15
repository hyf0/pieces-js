import * as babel from '@babel/core'
import { Visitor, BabelFileMetadata, ParserOptions } from '@babel/core'
import postcss, { AtRule, Declaration, Rule, stringify } from 'postcss'
import { getUniqueId } from './helper'
import { EnhancedNode } from './types'

export const pkgName = '@pieces-js/tag'

export class PiecesMetadata {
  importTagFnName: string = 'css'
  cssNodes: EnhancedNode[] = []
}

export type WithPiecesMetadata = BabelFileMetadata & {
  pieces: PiecesMetadata
}

type State = {
  file: {
    metadata: WithPiecesMetadata
  }
}

export default function collector({ types: t }: typeof babel): {
  visitor: Visitor<State>
} {
  return {
    visitor: {
      Program(_, state) {
        state.file.metadata.pieces = new PiecesMetadata()
      },
      ImportDeclaration(path, state) {
        if (path.node.source.value === pkgName) {
          path.traverse({
            ImportSpecifier(path) {
              if (
                path.node.local.name !==
                state.file.metadata.pieces.importTagFnName
              ) {
                state.file.metadata.pieces.importTagFnName =
                  path.node.local.name
              }
            },
          })
        } else {
          path.skip()
        }
      },
      TaggedTemplateExpression(path, state) {
        const { node } = path
        if (
          node.tag.type === 'Identifier' &&
          node.tag.name === state.file.metadata.pieces.importTagFnName
        ) {
          if (node.quasi.expressions.length > 0) {
            throw new SyntaxError(
              `@pieces-js/plugin doesn't support css\` ... \$\{expression\} ...\``
            )
          }

          const cssCode = node.quasi.quasis
            .map((node) => node.value.raw)
            .join('\n')


          const cssAst = postcss.parse(cssCode)

          cssAst.cleanRaws()

          const clsNameSet = new Set<string>()

          cssAst.nodes?.slice().forEach((node) => {
            switch (node.type) {
              case 'atrule':
                {
                  const raw = node.toString()
                  const hash = getUniqueId(raw)
                  state.file.metadata.pieces.cssNodes.push({
                    hash,
                    node,
                    raw,
                  })
                }
                break
              case 'decl':
                {
                  const raw = node.toString()
                  const hash = getUniqueId(raw)
                  clsNameSet.add(hash)

                  const uniqueRule = new Rule()
                  uniqueRule.append(node)
                  uniqueRule.selector = `.${hash}`
                  uniqueRule.cleanRaws()

                  state.file.metadata.pieces.cssNodes.push({
                    hash,
                    node: uniqueRule,
                    raw,
                  })
                }
                break
              case 'rule':
                {
                  if (node.selector.includes('&')) {
                    node.walkDecls((childDeclNode) => {
                      const uniqueRule = new Rule()
                      uniqueRule.append(childDeclNode)
                      uniqueRule.selector = node.selector
                      uniqueRule.cleanRaws()
                      // We need hash of 'decl + selector' to make no conflict with hash of decl
                      const raw = uniqueRule.toString()
                      const hash = getUniqueId(raw)
                      clsNameSet.add(hash)
                      uniqueRule.selector = uniqueRule.selector.replace(
                        '&',
                        `.${hash}`
                      )

                      state.file.metadata.pieces.cssNodes.push({
                        hash,
                        node: uniqueRule,
                        raw,
                      })
                    })
                  } else {
                    console.warn(
                      `pieces-js will ignore nested selector '${node.selector}' except contains '&'.\nIf you want this feature, describe it in https://github.com/iheyunfei/pieces-js/issues.`
                    )
                  }
                }
                break
              case 'comment':
                {
                }
                break
            }
          })

          path.replaceWith(t.stringLiteral([...clsNameSet.values()].join(' ')))
        } else {
          path.skip()
        }
      },
    },
  }
}

export const transformAndCollect = async (codes: string, filename: string) => {
  let ast = null as ReturnType<typeof babel.parse>

  const parserPlugins: ParserOptions['plugins'] = [
    'topLevelAwait',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'importMeta',
  ]

  if (!filename.endsWith('.ts')) {
    parserPlugins.push('jsx')
  }

  if (/\.tsx?$/.test(filename)) {
    parserPlugins.push('typescript')
  }

  try {
    ast = babel.parse(codes, {
      filename,
      parserOpts: {
        plugins: [...parserPlugins],
      },
      // ...parseOptions,
    })
  } catch (err) {
    throw err
  }

  const result = await babel.transformFromAstAsync(ast!, codes, {
    filename,
    //@ts-ignore
    plugins: [require.resolve('./babel-collect-plugin')],
    parserOpts: {
      plugins: [...parserPlugins],
    },
    babelrc: false,
    configFile: false,
    sourceMaps: true,
  })
  const { metadata, code: transformedCodes } = result!
  const {
    pieces: { cssNodes },
  } = metadata! as WithPiecesMetadata
  return {
    codes: transformedCodes ?? codes,
    cssNodes,
  }
}
