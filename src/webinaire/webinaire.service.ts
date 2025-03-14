import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebinaireApprenantEntity } from './entity/webinaire.entity';
import { CryptageService } from 'src/cryptage/cryptage.service';
import { ICreateWebinaire } from './entity/ICreateWebinaire';
import { ICryptage } from 'src/cryptage/interface/ICryptage';
import { ApprenantEntity } from 'src/apprenant/entity/apprenant.entity';

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
    private readonly cryptageService: CryptageService,
  ) {}

  /**
   * Ce service permet de créer un nouveau apprenant dans la base de données
   * @param {IWebinaire} dataWebinaire - Contient les informations pour créer un apprenant
   * @returns {Promise<WebinaireApprenantEntity>} - Retourne une promesse pour la création des apprenants
   */
  public async createWebinaire(
    dataWebinaire: ICreateWebinaire,
  ): Promise<WebinaireApprenantEntity> {
    const {
      keycloak_id_auteur,
      titre,
      categorie,
      type,
      niveau,
      image,
      source,
    } = dataWebinaire;

    // const apprenant = await this.apprenantRepository.findOne({
    //   where: { keycloak_id: keycloak_id_auteur },
    // });
    // console.log('apprenant', apprenant);

    // if (!apprenant) {
    //   throw new NotFoundException(`Le compte apprenant n'existe pas`);
    // }

    // apprenant.partage = false;
    // await this.apprenantRepository.save(apprenant);

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

    console.log(webinaire);

    return await this.webinaireApprenantEntity.save(webinaire);
  }

  public async getAllWebinaireApprenant() {
    const apprenant = await this.webinaireApprenantEntity.find();

    const decryptedWebinaire = apprenant.map((web) => ({
      webinaire_id: web.webinaire_apprenant_id,
      date: web.updatedAt,
      titre: web.titre,
      categorie: web.categorie,
      type: web.type,
      niveau: web.niveau,
      image: this.cryptageService.decrypt(web.image),
      source: this.cryptageService.decrypt(web.source),
    }));

    return decryptedWebinaire;
  }

  public async getAllWebinaireByKeycloakId(keycloak_id: string) {
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

    return decryptedWebinaire;
  }

  public async  getWebinaireById(webinaireId: string) {
    const webinaire = await this.webinaireApprenantEntity.findOne({
      where: {webinaire_apprenant_id: webinaireId},
    });

    const decryptedWebinaire = {
      date: webinaire!.createdAt,
      titre: webinaire!.titre,
      categorie: webinaire!.categorie,
      type: webinaire!.type,
      niveau: webinaire!.niveau,
      image: this.cryptageService.decrypt(webinaire!.image),
      source: this.cryptageService.decrypt(webinaire!.source),
    };

    return decryptedWebinaire;
  }

}
