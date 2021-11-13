import * as babel from '@babel/core';
import { Visitor, BabelFileMetadata } from '@babel/core';
import postcss, { AtRule, Declaration, Rule } from 'postcss';
import { getUniqueId } from './helper';
type Babel = typeof babel;

const pkgName = '@pieces-js/tag';

export class Metadata {
  importName: string = ''
  cssNodes: (AtRule | Rule | Declaration)[] = []
}

export type WithMetadata = BabelFileMetadata & {
  css: Metadata,
}

type State = {
  file: {
    metadata: WithMetadata
  }
};

export default function collector ({
  types: t,
}: Babel): { visitor: Visitor<State> } {
  // plugin contents

  return {
    visitor: {
      // exit() {

      // },
      Program(_, state) {
        state.file.metadata.css = new Metadata();
      },
      ImportDeclaration(path, state) {
        if (path.node.source.value === pkgName) {
          path.traverse({
            ImportSpecifier(path) {
              if (path.node.local.name !== state.file.metadata.css.importName) {
                state.file.metadata.css.importName = path.node.local.name;
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
          node.tag.name === state.file.metadata.css.importName
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
            state.file.metadata.css.cssNodes.push(node);
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
                state.file.metadata.css.cssNodes.push(uniqueRule);
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
            state.file.metadata.css.cssNodes.push(uniqueRule);
          });
          path.replaceWith(t.stringLiteral([...clsNameSet.values()].join(' ')));
        } else {
          path.skip();
        }
      },
    },
  };
}

export const transformAndCollect = (
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

  try {
    ast = babel.parse(codes, {
      filename,
      parserOpts: {
        plugins: [
          'jsx',
          'typescript',
          'topLevelAwait',
          'classProperties',
          'classPrivateProperties',
          'classPrivateMethods'
        ]
      },
      // ...parseOptions,
    });
  } catch (err) {
    throw err
  }

  const result = babel.transformFromAstSync(ast!, codes, {
    filename,
    //@ts-ignore
    plugins: [require.resolve('./babel-collect-plugin')],
    parserOpts: {
      plugins: [
        'jsx',
        'typescript',
        'topLevelAwait',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods'
      ]
    },
    babelrc: false,
    configFile: false,
    sourceMaps: true,
  });
  const { metadata, code: transformedCodes } = result!;
  const {
    css: { cssNodes },
  } = metadata! as WithMetadata;
  return {
    codes: transformedCodes ?? codes,
    cssNodes,
  };
};
