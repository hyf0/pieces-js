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

export const parseToPieces = (cssCode: string) => {
  const cssAst = postcss.parse(cssCode)

  cssAst.cleanRaws()

  const clsNameSet = new Set<string>()
  const nodes: EnhancedNode[] = []

  cssAst.nodes?.slice().forEach((node) => {
    switch (node.type) {
      case 'atrule':
        {
          const raw = node.toString()
          const hash = getUniqueId(raw)
          nodes.push({
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

          nodes.push({
            hash,
            node: uniqueRule,
            raw,
          })
        }
        break
      case 'rule':
        {
          if (node.selector.startsWith('&:')) {
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

              nodes.push({
                hash,
                node: uniqueRule,
                raw,
              })
            })
          } else {
            throw new Error(
              `Not supported selector '${node.selector}'.\nIf you want this feature, describe it in https://github.com/iheyunfei/pieces-js/issues.`
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

  return {
    className: clsNameSet.size === 0 ? '' : [...clsNameSet.values()].join(' '),
    nodes,
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
          
          const { className, nodes } = parseToPieces(cssCode)

          state.file.metadata.pieces.cssNodes.push(...nodes)

          path.replaceWith(t.stringLiteral(className))
        } else {
          path.skip()
        }
      },
    },
  }
}