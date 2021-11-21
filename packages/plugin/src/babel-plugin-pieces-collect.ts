import * as babel from '@babel/core'
import { Visitor, BabelFileMetadata } from '@babel/core'
import postcss, { Rule, ChildNode } from 'postcss'
import { genNoConfilctHash } from './utils'
import { EnhancedNode } from './EnhancedNode'

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

const throwIfCSSNodeNotSupported = (node: ChildNode) => {
  switch (node.type) {
    case 'atrule':
      return true
    case 'decl':
      return true
    case 'rule': {
      if (!node.selector.startsWith('&:')) {
        throw new Error(
          `Not supported selector '${node.selector}'.\nIf you think it should be supproted, describe it in https://github.com/iheyunfei/pieces-js/issues.`
        )
      }
      return true
    }
  }
  return true
}

export const parseToPieces = (cssCode: string) => {
  const cssAst = postcss.parse(cssCode)

  cssAst.cleanRaws()

  const clsNameSet = new Set<string>()
  const nodes: EnhancedNode[] = []

  cssAst.nodes?.slice().forEach((node) => {
    throwIfCSSNodeNotSupported(node)

    switch (node.type) {
      case 'atrule':
        {
          node.nodes.slice().forEach(childNode => {
            if (childNode.type === 'decl') {
              const raw = childNode.toString()
              const hash = genNoConfilctHash(raw)
              clsNameSet.add(hash)

              const uniqueRule = new Rule()
              uniqueRule.append(childNode.clone())
              uniqueRule.selector = `.${hash}`
              uniqueRule.cleanRaws()

              childNode.replaceWith(uniqueRule)
            }
          })
          const raw = node.toString()
          const hash = genNoConfilctHash(raw)
          nodes.push(new EnhancedNode(node, hash))
        }
        break
      case 'decl':
        {
          const raw = node.toString()
          const hash = genNoConfilctHash(raw)
          clsNameSet.add(hash)

          const uniqueRule = new Rule()
          uniqueRule.append(node)
          uniqueRule.selector = `.${hash}`
          uniqueRule.cleanRaws()

          nodes.push(new EnhancedNode(uniqueRule, hash))
        }
        break
      case 'rule':
        {
          node.walkDecls((childDeclNode) => {
            const uniqueRule = new Rule()
            uniqueRule.append(childDeclNode)
            uniqueRule.selector = node.selector
            uniqueRule.cleanRaws()
            // We need hash of 'decl + selector' to make no conflict with hash of decl
            const raw = uniqueRule.toString()
            const hash = genNoConfilctHash(raw)
            clsNameSet.add(hash)
            uniqueRule.selector = uniqueRule.selector.replace('&', `.${hash}`)

            nodes.push(new EnhancedNode(uniqueRule, hash))
          })
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
              // Handle case like: import { css as jss } from '@pieces-js/tag'
              if (
                path.node.local.name !==
                state.file.metadata.pieces.importTagFnName
              ) {
                state.file.metadata.pieces.importTagFnName =
                  path.node.local.name
              }
            },
          })
          
          // Remove it. Since it won't be used in runtime.
          path.remove()
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
