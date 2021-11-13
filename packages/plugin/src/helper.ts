import crypto from 'crypto';

export const getUniqueId = (key: string) =>
  `_${crypto.createHash('sha1').update(key).digest('hex').slice(0, 4)}`;
