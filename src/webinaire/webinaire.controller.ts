import {
  BadRequestException,
  Body,
  Controller,
  UploadedFiles,
} from '@nestjs/common';
import { WebinaireService } from './webinaire.service';
import { MessagePattern } from '@nestjs/microservices';
import { NextcloudService } from 'src/nextcloud/nextcloud.service';
import { ICreateWebinaire } from './entity/ICreateWebinaire';

@Controller()
export class WebinaireController {
  constructor(
    private readonly webinaireService: WebinaireService,
    private readonly nextcloudService: NextcloudService,
  ) {}

  @MessagePattern('createWebinaire')
  public async createWebinaire(
    @UploadedFiles()
    files: {
      image: Express.Multer.File[];
      source: Express.Multer.File[];
    },
    @Body() createWebinaireDto: ICreateWebinaire,
  ) {
    const imageFile = files.image[0];
    const sourceFile = files.source[0];

    if (!imageFile || !sourceFile) {
      throw new BadRequestException(
        'Les fichiers image et source sont requis.',
      );
    }

    const imageFilePath = `/talentup/images/${Date.now()}-${imageFile.originalname}`;
    const sourceFilePath = `/talentup/sources/${Date.now()}-${sourceFile.originalname}`;

    const imageUrl = await this.nextcloudService.uploadFile(
      imageFilePath,
      imageFile.buffer,
    );

    const sourceUrl = await this.nextcloudService.uploadFile(
      sourceFilePath,
      sourceFile.buffer,
    );

    createWebinaireDto.image = imageUrl;

    createWebinaireDto.source = sourceUrl;

    const dataWebinaire = {
      keycloak_id: createWebinaireDto.keycloak_id,
      titre: createWebinaireDto.titre,
      categorie: createWebinaireDto.categorie,
      type: createWebinaireDto.type,
      niveau: createWebinaireDto.niveau,
      image: createWebinaireDto.image,
      source: createWebinaireDto.source,
      auteur: createWebinaireDto.auteur,
    };

    return this.webinaireService.createWebinaire(dataWebinaire);
  }
}
