import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebinaireApprenantEntity } from './entity/webinaire.entity';
import { CryptageService } from 'src/cryptage/cryptage.service';
import { ICreateWebinaire } from './entity/ICreateWebinaire';
import { ICryptage } from 'src/cryptage/interface/ICryptage';
import { ApprenantEntity } from 'src/apprenant/entity/apprenant.entity';
import { ControleWebinaireEntity } from './entity/controle-webinaire.entity';
import { LoggerService } from 'src/logger/logger.service';

interface IWebinaire {
  keycloak_id_auteur: string;
  titre: string;
  categorie: string;
  type: string;
  niveau: string;
  image: ICryptage;
  source: ICryptage;
}

@Injectable()
export class WebinaireService {
  constructor(
    @InjectRepository(WebinaireApprenantEntity)
    private readonly webinaireApprenantEntity: Repository<WebinaireApprenantEntity>,
    @InjectRepository(ApprenantEntity)
    private readonly apprenantRepository: Repository<ApprenantEntity>,
    @InjectRepository(ControleWebinaireEntity)
    private readonly controleWebinaireRepository: Repository<ControleWebinaireEntity>,
    private readonly cryptageService: CryptageService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(WebinaireService.name);
  }

  /**
   * Ce service permet de créer un nouveau apprenant dans la base de données
   * @param {IWebinaire} dataWebinaire - Contient les informations pour créer un apprenant
   * @returns {Promise<WebinaireApprenantEntity>} - Retourne une promesse pour la création des apprenants
   */
  public async createWebinaire(
    dataWebinaire: ICreateWebinaire,
  ): Promise<WebinaireApprenantEntity> {
    this.logger.log(`Service pour créer un webinaire`);
    const {
      keycloak_id_auteur,
      titre,
      categorie,
      type,
      niveau,
      image,
      source,
    } = dataWebinaire;

    const encryptedImage = this.cryptageService.encrypt(image);
    const encryptedSource = this.cryptageService.encrypt(source);

    const webinaire = this.webinaireApprenantEntity.create({
      keycloak_id_auteur,
      titre,
      categorie,
      type,
      niveau,
      image: encryptedImage,
      source: encryptedSource,
    });

    this.logger.log(`Service pour créer un webinaire 2`);
    const apprenant = await this.apprenantRepository.findOne({
      where: { keycloak_id: keycloak_id_auteur },
    });

    if (!apprenant) {
      throw new NotFoundException(`Le compte apprenant n' existe pas`);
    }
    this.logger.log(`Service pour créer un webinaire 3`);
    apprenant.partage = true;
    await this.apprenantRepository.save(apprenant);
    this.logger.log(`Service pour créer un webinaire 4`);
    this.logger.log(`Enregistrement dans la base de données`);
    return await this.webinaireApprenantEntity.save(webinaire);
  }

  public async getAllWebinaireApprenant() {
    this.logger.log(`Service pour voir un webinaire`);
    const apprenant = await this.webinaireApprenantEntity.find();

    const decryptedWebinaire = apprenant.map((web) => ({
      webinaire_id: web.webinaire_apprenant_id,
      date: web.updatedAt,
      titre: web.titre,
      categorie: web.categorie,
      type: web.type,
      niveau: web.niveau,
      image: this.cryptageService.decrypt(web.image),
    }));

    this.logger.log(`Affichage du webinaire`);
    return decryptedWebinaire;
  }

  public async getAllWebinaireByKeycloakId(keycloak_id: string) {
    this.logger.log(`Service pour voir tous les webinaires d'un apprenant`);
    const webinaire = await this.webinaireApprenantEntity.find({
      where: { keycloak_id_auteur: keycloak_id },
    });

    if (webinaire.length === 0) {
      return [];
    }

    const decryptedWebinaire = webinaire.map((web) => ({
      webinaire_id: web.webinaire_apprenant_id,
      date: web.updatedAt,
      titre: web.titre,
      categorie: web.categorie,
      type: web.type,
      niveau: web.niveau,
      image: this.cryptageService.decrypt(web.image),
      source: this.cryptageService.decrypt(web.source),
    }));

    this.logger.log(`Affichage de tous les webinaires de l'étudiant`);
    return decryptedWebinaire;
  }

  public async getWebinaireById(data: {
    webinaireId: string;
    keycloak_id_auteur: string;
  }) {
    this.logger.log(`Service pour prendre un webinaire d'un étudiant`);
    const { webinaireId, keycloak_id_auteur } = data;

    try {
      // Vérifie l'id keycloak de l'apprenant
      const apprenant = await this.apprenantRepository.findOne({
        where: { keycloak_id: keycloak_id_auteur },
      });

      if (!apprenant) {
        throw new NotFoundException('Apprenant inexistant!');
      }

      // Prend le status de partage de l'apprenant
      const sharing: boolean = apprenant.partage;

      // Regarde si le controle du webinaire existe déjà
      const controleWebinaire = await this.controleWebinaireRepository.find({
        where: { webinaire_id: webinaireId, keycloak_id: keycloak_id_auteur },
      });

      const webinaire = await this.webinaireApprenantEntity.findOne({
        where: { webinaire_apprenant_id: webinaireId },
      });

      // Si le partage est true et le controleWebinaire est vide
      if (sharing && controleWebinaire.length === 0) {
        const data = {
          keycloak_id: keycloak_id_auteur,
          webinaire_id: webinaireId,
        };

        const dataControle = this.controleWebinaireRepository.create(data);
        await this.controleWebinaireRepository.save(dataControle);

        apprenant.partage = false;
        this.apprenantRepository.save(apprenant);

        const dataWebinaire = {
          date: webinaire?.updatedAt,
          titre: webinaire?.titre,
          categorie: webinaire?.categorie,
          type: webinaire?.type,
          niveau: webinaire?.niveau,
          image: this.cryptageService.decrypt(webinaire!.image),
          source: this.cryptageService.decrypt(webinaire!.source),
        };

        this.logger.log(`Affichage d'un webinaire`);
        return dataWebinaire;
      }

      // Si le partage est true et le controleWebinaire n'est pas vide
      if (sharing && controleWebinaire.length !== 0) {
        const dataWebinaire = {
          date: webinaire?.updatedAt,
          titre: webinaire?.titre,
          categorie: webinaire?.categorie,
          type: webinaire?.type,
          niveau: webinaire?.niveau,
          image: this.cryptageService.decrypt(webinaire!.image),
          source: this.cryptageService.decrypt(webinaire!.source),
        };

        this.logger.log(`Affichage d'un webinaire`);
        return dataWebinaire;
      }

      // Si le partage est false et le controleWebinaire n'est pas vide
      if (!sharing && controleWebinaire.length !== 0) {
        const dataWebinaire = {
          date: webinaire?.updatedAt,
          titre: webinaire?.titre,
          categorie: webinaire?.categorie,
          type: webinaire?.type,
          niveau: webinaire?.niveau,
          image: this.cryptageService.decrypt(webinaire!.image),
          source: this.cryptageService.decrypt(webinaire!.source),
        };

        this.logger.log(`Affichage d'un webinaire`);
        return dataWebinaire;
      }

      // Si le partage est false et le controleWebinaire est vide
      if (!sharing && controleWebinaire.length === 0) {
        throw new ForbiddenException(
          `Vous ne pouvez pas voir ce webinaire, partager d'abord`,
        );
      }
    } catch (error) {
      this.logger.error(`Erreur dans getWebinaireById : ${error}`);

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error; // Propager les exceptions personnalisées
      }

      this.logger.error(
        `Une erreur est survenue lors de la récupération du webinaire.`,
      );
      throw new ForbiddenException(
        `Une erreur est survenue lors de la récupération du webinaire.`,
      );
    }
  }
}
