import crypto from 'crypto'

const getHash = (key: string) => {
  const hash = crypto.createHash('sha1').update(key).digest('hex')
  return hash
}

const hashToKeyMap = new Map<string, string>()

export const genNoConfilctHash = (key: string, len = 5): string => {
  let hash = `_${getHash(key).slice(0, len)}`
  let lastKey = hashToKeyMap.get(hash)

  while (lastKey !== undefined && lastKey !== key) {
    hash += getHash(hash).slice(0, 1)
    lastKey = hashToKeyMap.get(hash)
  }

  if (!lastKey) {
    hashToKeyMap.set(hash, key)
  }

  return hash
}
