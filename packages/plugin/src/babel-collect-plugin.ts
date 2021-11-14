import * as babel from '@babel/core';
import { Visitor, BabelFileMetadata, ParserOptions } from '@babel/core';
import postcss, { AtRule, Declaration, Rule } from 'postcss';
import { getUniqueId } from './helper';
import { CSSNode } from './types';

const pkgName = '@pieces-js/tag';

export class PiecesMetadata {
  importTagFnName: string = 'css'
  cssNodes: CSSNode[] = []
}

export type WithPiecesMetadata = BabelFileMetadata & {
  pieces: PiecesMetadata,
}

type State = {
  file: {
    metadata: WithPiecesMetadata
  }
};

export default function collector ({
  types: t,
}: typeof babel): { visitor: Visitor<State> } {
  return {
    visitor: {
      Program(_, state) {
        state.file.metadata.pieces = new PiecesMetadata();
      },
      ImportDeclaration(path, state) {
        if (path.node.source.value === pkgName) {
          path.traverse({
            ImportSpecifier(path) {
              if (path.node.local.name !== state.file.metadata.pieces.importTagFnName) {
                state.file.metadata.pieces.importTagFnName = path.node.local.name;
              }
            },
          });
        } else {
          path.skip();
        }
      },
      TaggedTemplateExpression(path, state) {
        const { node } = path;
        if (
          node.tag.type === 'Identifier' &&
          node.tag.name === state.file.metadata.pieces.importTagFnName
        ) {
          const clsNameSet = new Set<string>();
          if (node.quasi.expressions.length > 0) {
            throw new SyntaxError(
              `@pieces-js/plugin doesn't support css\` ... \$\{expression\} ...\``,
            );
          }
          const template = node.quasi.quasis
            .map((node) => node.value.raw)
            .join('\n');
          const cssAst = postcss.parse(template);

          cssAst.cleanRaws();

          cssAst.walkAtRules((node) => {
            state.file.metadata.pieces.cssNodes.push(node);
            node.remove();
          });

          cssAst.walkRules((node) => {
            if (node.selector.includes('&')) {
              node.walkDecls((childDeclNode) => {
                const uniqueRule = new Rule();
                uniqueRule.append(childDeclNode.toString());
                uniqueRule.selector = node.selector;
                const clsName = getUniqueId(uniqueRule.toString());
                uniqueRule.selector = uniqueRule.selector.replace('&', `.${clsName}`);
                clsNameSet.add(clsName);
                uniqueRule.cleanRaws();
                state.file.metadata.pieces.cssNodes.push(uniqueRule);
              });
            }
            node.remove();
          });
          cssAst.walkDecls((node) => {
            const uniqueRule = new Rule();
            const decl = node.toString();
            const clsName = getUniqueId(decl);
            uniqueRule.append(decl);
            uniqueRule.selector = `.${clsName}`;
            clsNameSet.add(clsName);
            uniqueRule.cleanRaws();
            state.file.metadata.pieces.cssNodes.push(uniqueRule);
          });
          path.replaceWith(t.stringLiteral([...clsNameSet.values()].join(' ')));
        } else {
          path.skip();
        }
      },
    },
  };
}

export const transformAndCollect = async (
  codes: string,
  filename: string,
) => {
  if (!codes.includes(pkgName)) {
    return {
      codes,
      cssNodes: [],
    }
  }


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
        plugins: [
          ...parserPlugins,
        ]
      },
      // ...parseOptions,
    });
  } catch (err) {
    throw err
  }

  const result = await babel.transformFromAstAsync(ast!, codes, {
    filename,
    //@ts-ignore
    plugins: [require.resolve('./babel-collect-plugin')],
    parserOpts: {
      plugins: [
        ...parserPlugins,
      ]
    },
    babelrc: false,
    configFile: false,
    sourceMaps: true,
  });
  const { metadata, code: transformedCodes } = result!;
  const {
    pieces: { cssNodes },
  } = metadata! as WithPiecesMetadata;
  return {
    codes: transformedCodes ?? codes,
    cssNodes,
  };
};
