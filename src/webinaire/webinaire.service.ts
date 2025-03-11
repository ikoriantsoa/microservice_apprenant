import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebinaireApprenantEntity } from './entity/webinaire.entity';
import { CryptageService } from 'src/cryptage/cryptage.service';
import { ICreateWebinaire } from './entity/ICreateWebinaire';

@Injectable()
export class WebinaireService {
  constructor(
    @InjectRepository(WebinaireApprenantEntity)
    private readonly webinaireApprenantEntity: Repository<WebinaireApprenantEntity>, private readonly cryptageService: CryptageService) {}

  public async createWebinaire(dataWebinaire: ICreateWebinaire) {
    const cryptWebinaire = {
        keycloak_id: dataWebinaire.keycloak_id,
        titre: dataWebinaire.titre,
        categorie: dataWebinaire.categorie,
        type: dataWebinaire.type,
        niveau: dataWebinaire.niveau,
        image: dataWebinaire.image,
        source: dataWebinaire.source,
        auteur: dataWebinaire.auteur,
    };

    const webinaire = this.webinaireApprenantEntity.create(cryptWebinaire);
    return await this.webinaireApprenantEntity.save(webinaire);
  }
}
