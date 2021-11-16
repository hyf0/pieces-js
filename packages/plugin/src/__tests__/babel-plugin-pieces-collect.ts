import { collect } from '../collect'
import { parseToPieces } from '../babel-plugin-pieces-collect'

describe('babel-plugin-pieces-collect', () => {
  it('basic', async () => {
    const { code, cssNodes } = await collect(
      `css
        \`
          color: red;
        \`
    `,
      '.js'
    )
    cssNodes.forEach((node) => {
      expect(code).toContain(node.hash)
    })
    //  babel.parse()
  })
})

describe('parseToPieces', () => {
  it('should gennerate same hash for same node', () => {
    {
      const { className: cls1 } = parseToPieces(`
        color: red;
      `)
      const { className: cls2 } = parseToPieces(`
        color: red;
      `)
      expect(cls1).toBe(cls2)
    }
    {
      const { className: cls1 } = parseToPieces(`
        color: red;
      `)
      const { className: cls2 } = parseToPieces(`
        font-size: 12px;
        color: red;
      `)
      expect(cls2).toContain(cls1)
    }
  })
})
