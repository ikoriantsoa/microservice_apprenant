import { BadRequestException, Body, Controller } from '@nestjs/common';
import { WebinaireService } from './webinaire.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NextcloudService } from 'src/nextcloud/nextcloud.service';
import { TCreateWebinaire } from './entity/ICreateWebinaire';
import { LoggerService } from 'src/logger/logger.service';

@Controller()
export class WebinaireController {
  constructor(
    private readonly webinaireService: WebinaireService,
    private readonly nextcloudService: NextcloudService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(WebinaireController.name);
  }

  @MessagePattern('createWebinaire')
  public async createWebinaire(@Payload() dataInfoWebinaire: TCreateWebinaire) {
    this.logger.log(`Contrôleur pour créer les webiniares apprenants`);
    const { image, source } = dataInfoWebinaire;

    // Validation des champs requis
    if (!image || !source) {
      throw new BadRequestException(
        'Les fichiers image et source sont requis.',
      );
    }

    // Validation du type et de la taille de l'image
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedImageTypes.includes(image.mimetype)) {
      throw new BadRequestException(
        'Le fichier image doit être au format JPEG, PNG ou GIF.',
      );
    }
    if (image.size > 2 * 1024 * 1024) {
      throw new BadRequestException(
        "La taille de l'image ne doit pas dépasser 2 Mo.",
      );
    }

    // Validation du type et de la taille de la source
    const allowedSourceTypes = ['video/mp4'];
    if (!allowedSourceTypes.includes(source.mimetype)) {
      throw new BadRequestException(
        'Le fichier source doit être au format MP4.',
      );
    }
    if (source.size > 50 * 1024 * 1024) {
      throw new BadRequestException(
        'La taille de la source ne doit pas dépasser 50 Mo.',
      );
    }

    // Création des chemins pour l'image et la source
    const imageFilePath = `/talentup/apprenants/images/${Date.now()}-${image.originalname}`;
    const sourceFilePath = `/talentup/apprenants/sources/${Date.now()}-${source.originalname}`;

    try {
      // Upload de l'image
      const imageUrl = await this.nextcloudService.uploadFile(
        imageFilePath,
        image.buffer,
      );

      const imagePublicLink =
        await this.nextcloudService.createPublicLink(imageUrl);

      // Upload de la source
      const sourceUrl = await this.nextcloudService.uploadFile(
        sourceFilePath,
        source.buffer,
      );

      const sourcePublicLink =
        await this.nextcloudService.createPublicLink(sourceUrl);

      // Préparation des données pour le webinaire
      const dataWebinaire = {
        ...dataInfoWebinaire,
        image: imagePublicLink,
        source: sourcePublicLink,
      };

      // Création du webinaire
      return this.webinaireService.createWebinaire(dataWebinaire);
    } catch (error) {
      this.logger.error(`Une erreur est survenue lors de la création du webinaire: ${error}`);
      throw new BadRequestException(
        'Une erreur est survenue lors de la création du webinaire.',
      );
    }
  }

  @MessagePattern('getAllWebinaireApprenant')
  public getWebinaireByKeycloakId(keycloak_id: string) {
    this.logger.log(`Contrôleur pour affciher les webinaires d'un apprenant`);
    return this.webinaireService.getAllWebinaireByKeycloakId(keycloak_id);
  }

  @MessagePattern('getAllWebinaire')
  public getAllWebinaire() {
    this.logger.log(`Contrôleur pour afficher tous les webinaires`);
    return this.webinaireService.getAllWebinaireApprenant();
  }

  @MessagePattern('getWebinaireById')
  public getWebinaireById(
    @Payload() data: { webinaireId: string; keycloak_id_auteur: string },
  ) {
    this.logger.log(`Contrôleur pour afficher un webinaire`);
    return this.webinaireService.getWebinaireById(data);
  }
}
