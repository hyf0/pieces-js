import { AtRule, Declaration, Rule } from 'postcss';

export type CSSNode = AtRule | Rule | Declaration

export type EnhancedNode = {
  node: CSSNode,
  hash: string,
}