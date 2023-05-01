import * as crypto from 'crypto';

export class HashUtils {
  public static createHash(data: string, outputLength = 6) {
    return crypto
      .createHash('shake256', { outputLength })
      .update(data)
      .digest('hex');
  }
}
