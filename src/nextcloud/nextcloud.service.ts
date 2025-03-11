import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NextcloudService {
  private readonly baseUrl = `${process.env.BASE_URL}`;
  private readonly auth = {
    username: 'talentup',
    password: 'Madastart1234*',
  };

  public async createDirectory(directoryPath: string): Promise<void> {
    const url = `${this.baseUrl}${directoryPath}`;
    try {
      await axios({
        method: 'MKCOL',
        url,
        auth: this.auth,
      });
      console.log(`Répertoire créé: ${url}`);
    } catch (error) {
      if (error.response?.status === 405) {
        console.log(`Le répertoire existe déjà: ${url}`);
      } else {
        console.error('Erreur lors de la création du répertoire:', error);
        throw error;
      }
    }
  }

  public async uploadFile(filePath: string, fileBuffer: Buffer): Promise<string> {
    const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));
    await this.createDirectory(directoryPath);

    const url = `${this.baseUrl}${filePath}`;
    try {
      await axios.put(url, fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        auth: this.auth,
      });
      console.log('Fichier uploader:', url);
      return url;
    } catch (error) {
      console.error(`Erreur lors de l'upload du fichier`, error);
      throw error;
    }
  }
}
