import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NextcloudService {
  private readonly baseUrl = process.env.BASE_URL;
  private readonly auth = {
    username: 'talentup',
    password: 'Madastart1234*',
  };
  private readonly nextUrl = process.env.URL;
  
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

  public async uploadFile(
    filePath: string,
    fileBuffer: Buffer,
  ): Promise<string> {
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

  public async createPublicLink(filePath: string): Promise<string> {
    const url = `${this.nextUrl}/ocs/v2.php/apps/files_sharing/api/v1/shares`;
    console.log('url: ', url);
    
    try {
      const response = await axios.post(
        url,
        new URLSearchParams({
          path: filePath,
          shareType: '3',
          permissions: '1',
        }),
        {
          headers: {
            'OCS-APIRequest': 'true',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: this.auth,
        },
      );

      console.log("Réponse de l'API de partage:", response.data);

      if (response.data?.ocs?.meta?.status === 'failure') {
        throw new Error(
          `Échec de la création du lien public : ${response.data.ocs.meta.message}`,
        );
      }

      const publicLink = response.data.ocs.data.url;
      console.log(`Lien public créé: ${publicLink}`);
      return publicLink;
    } catch (error) {
      console.error(`Erreur lors de la création du lien public; `, error.response?.data || error.message);
      throw new Error('Impossible de créer le lien public', error);
    }
  }
}
