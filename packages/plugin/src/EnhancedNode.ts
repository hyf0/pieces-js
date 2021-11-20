import { AtRule, Declaration, Rule } from 'postcss';

export type CSSNode = AtRule | Rule | Declaration

export class EnhancedNode {

  constructor(public node: CSSNode, public hash: string) {

  }
  private _gennerated: null | string = null
  gennerate() {
    if (!this._gennerated) {
      this._gennerated = this.node.toString()
    }
    return this._gennerated
  }
}