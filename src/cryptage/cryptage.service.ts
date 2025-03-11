import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ICryptage } from './interface/ICryptage';

@Injectable()
export class CryptageService {
  private readonly algorithm = `${process.env.ALGORITHME}`;
  private readonly key = Buffer.from(`${process.env.ENCRYPT_KEY}`, 'base64');

  /**
   * Cette méthode permet de crypter un texte clair en un texte crypté
   * @param {string} text - Le texte claire à crypter 
   * @returns {ICryptage} - Retourne le cryptage du texte clair
   */
  public encrypt(text: string): ICryptage {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      iv: iv.toString('hex'),
      encryptedText: encrypted,
    };
  }

  /**
   * Cette méthode permet de décrypter un texte crypté en un texte clair
   * @param {ICryptage} encryptedData - Le texte crypté à tranformer en texte clair
   * @returns  {string} - Retourne le décryptage du texte crypté
   */
  public decrypt(encryptedData: ICryptage): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encryptedData.iv, 'hex'),
    );

    let decrypted = decipher.update(encryptedData.encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
