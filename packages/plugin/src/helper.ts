import crypto from 'crypto';

// TODO: avoid hash collision
export const getUniqueId = (key: string) =>
  `_${crypto.createHash('sha1').update(key).digest('hex').slice(0, 5)}`;
