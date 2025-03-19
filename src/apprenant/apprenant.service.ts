import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApprenantEntity } from './entity/apprenant.entity';
import { Repository } from 'typeorm';
import { CryptageService } from 'src/cryptage/cryptage.service';
import { ICreateApprenant } from './entity/ICreateApprenant';
import { MessagePattern } from '@nestjs/microservices';
import { ICryptage } from 'src/cryptage/interface/ICryptage';
import { WebinaireApprenantEntity } from 'src/webinaire/entity/webinaire.entity';
import { LoggerService } from 'src/logger/logger.service';

interface IData {
  keycloak_id: string;
  username: ICryptage;
  email: ICryptage;
  firstname: ICryptage;
  lastname: ICryptage;
  adresse: ICryptage;
}

@Injectable()
export class ApprenantService {
  constructor(
    @InjectRepository(ApprenantEntity)
    private readonly apprenantRepository: Repository<ApprenantEntity>,
    @InjectRepository(WebinaireApprenantEntity)
    private readonly webinaireRepository: Repository<WebinaireApprenantEntity>,
    private readonly cryptageService: CryptageService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Cette méthode asynchrone permet de créer un nouveau apprenant
   * @param {ICreateApprenant} newApprenant - Insère les informations de l'apprenant à créer
   * @returns {Promise<ApprenantEntity>} - Retourne une promesse qui permet d'enregistrer un apprenant dans la base de données
   */
  public async createApprenant(
    newApprenant: ICreateApprenant,
  ): Promise<ApprenantEntity> {
    this.logger.log(`Service pour créer un webinaire`);
    const cryptApprenant: IData = {
      keycloak_id: newApprenant.keycloak_id,
      username: this.cryptageService.encrypt(newApprenant.username),
      email: this.cryptageService.encrypt(newApprenant.email),
      firstname: this.cryptageService.encrypt(newApprenant.firstname),
      lastname: this.cryptageService.encrypt(newApprenant.lastname),
      adresse: this.cryptageService.encrypt(newApprenant.adresse),
    };

    const apprenant: ApprenantEntity =
      this.apprenantRepository.create(cryptApprenant);
    this.logger.log(`Création d'un webinaire dans la base de données`);
    return await this.apprenantRepository.save(apprenant);
  }

  public async getAllWebinaireAlternant() {
    this.logger.log(`Méthode pour prendre tous les webinaires d'un apprenant`);
    const apprenants = await this.webinaireRepository.find();

    const decryptedWebinaire = apprenants.map((web) => ({
      titre: web.titre,
      categorie: web.categorie,
      type: web.type,
      niveau: web.niveau,
      image: this.cryptageService.decrypt(web.image),
      source: this.cryptageService.decrypt(web.source),
    }));

    this.logger.log(`Affichage des informations du webinaire`);
    return decryptedWebinaire;
  }

  public async getAllWebinaireByKeycloakId(keycloak_id: string) {
    this.logger.log(`Service pour afficher les webinaires de l'id keycloak`);
    const webinaire = await this.webinaireRepository.find({
      where: { keycloak_id_auteur: keycloak_id },
    });

    if (webinaire.length === 0) {
      return [];
    }

    const decryptedWebinaire = webinaire.map((web) => ({
      titre: web.titre,
      categorie: web.categorie,
      type: web.type,
      niveau: web.niveau,
      image: this.cryptageService.decrypt(web.image),
      source: this.cryptageService.decrypt(web.source),
    }));
    this.logger.log(`Affichage dde webinaires`);

    return decryptedWebinaire;
  }
}
