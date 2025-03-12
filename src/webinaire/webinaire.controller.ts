import {
  BadRequestException,
  Body,
  Controller,
} from '@nestjs/common';
import { WebinaireService } from './webinaire.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NextcloudService } from 'src/nextcloud/nextcloud.service';
import { TCreateWebinaire } from './entity/ICreateWebinaire';

@Controller()
export class WebinaireController {
  constructor(
    private readonly webinaireService: WebinaireService,
    private readonly nextcloudService: NextcloudService,
  ) {}

  @MessagePattern('createWebinaire')
  public async createWebinaire(@Payload() dataInfoWebinaire: TCreateWebinaire) {
    const { image, source } = dataInfoWebinaire;

    if (!image || !source) {
      throw new BadRequestException('Les fichiers image et souce sont requis.');
    }

    const imageFilePath = `/talentup/images/${Date.now()}-${image.originalname}`;
    const sourceFilePath = `/talentup/sources/${Date.now()}-${source.originalname}`;

    const imageUrl = await this.nextcloudService.uploadFile(
      imageFilePath,
      image.buffer,
    );
    console.log('imageUrl ', imageUrl);

    const sourceUrl = await this.nextcloudService.uploadFile(
      sourceFilePath,
      source.buffer,
    );
    console.log('sourceUrl', sourceUrl);

    const dataWebinaire = {
      ...dataInfoWebinaire,
      image: imageUrl,
      source: sourceUrl,
    };
    console.log(dataWebinaire);
    

    return this.webinaireService.createWebinaire(dataWebinaire);
  }

  @MessagePattern('getAllWebinaireApprenant')
  public getWebinaireByKeycloakId(keycloak_id: string) {
    return this.webinaireService.getAllWebinaireByKeycloakId(keycloak_id);
  }

  @MessagePattern('getAllWebinaire')
  public getAllWebinaire() {
    return this.webinaireService.getAllWebinaireApprenant();
  }
}
