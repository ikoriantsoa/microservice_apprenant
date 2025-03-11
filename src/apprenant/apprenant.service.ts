import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApprenantEntity } from './entity/apprenant.entity';
import { Repository } from 'typeorm';
import { CryptageService } from 'src/cryptage/cryptage.service';
import { ICreateApprenant } from './entity/ICreateApprenant';
import { MessagePattern } from '@nestjs/microservices';
import { ICryptage } from 'src/cryptage/interface/ICryptage';

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
    private readonly cryptageService: CryptageService,
  ) {}

  /**
   * Cette méthode asynchrone permet de créer un nouveau apprenant
   * @param {ICreateApprenant} newApprenant - Insère les informations de l'apprenant à créer
   * @returns {Promise<ApprenantEntity>} - Retourne une promesse qui permet d'enregistrer un apprenant dans la base de données
   */
  public async createApprenant(
    newApprenant: ICreateApprenant,
  ): Promise<ApprenantEntity> {
    const cryptApprenant: IData = {
      keycloak_id: newApprenant.keycloak_id,
      username: this.cryptageService.encrypt(newApprenant.username),
      email: this.cryptageService.encrypt(newApprenant.email),
      firstname: this.cryptageService.encrypt(newApprenant.firstname),
      lastname: this.cryptageService.encrypt(newApprenant.lastname),
      adresse: this.cryptageService.encrypt(newApprenant.adresse),
    };

    const apprenant: ApprenantEntity = this.apprenantRepository.create(cryptApprenant);
    return await this.apprenantRepository.save(apprenant);
  }
}
