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

    const apprenant = await this.apprenantRepository.findOne({
      where: { keycloak_id: keycloak_id_auteur },
    });
    console.log('apprenant', apprenant);
    

    if (!apprenant) {
      throw new NotFoundException(`Le compte apprenant n'existe pas`);
    }

    apprenant.partage = false;
    await this.apprenantRepository.save(apprenant);

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
}
