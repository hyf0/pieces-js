import { genNoConfilctHash } from '../helper'

describe('hash', () => {
  it('avoid hash collision', () => {
    const hashSet = new Set()
    Array(100)
      .fill(null)
      .forEach((_, idx) => {
        const hash = genNoConfilctHash(String(idx), 1)
        expect(hashSet.has(hash)).toBe(false)
        hashSet.add(hash)
      })
    console.log('hashSet', hashSet)
  })
})
