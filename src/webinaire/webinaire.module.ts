import { Module } from '@nestjs/common';
import { WebinaireController } from './webinaire.controller';
import { WebinaireService } from './webinaire.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprenantEntity } from 'src/apprenant/entity/apprenant.entity';
import { WebinaireApprenantEntity } from './entity/webinaire.entity';
import { CryptageModule } from 'src/cryptage/cryptage.module';
import { CryptageService } from 'src/cryptage/cryptage.service';
import { NextcloudModule } from 'src/nextcloud/nextcloud.module';
import { NextcloudService } from 'src/nextcloud/nextcloud.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprenantEntity, WebinaireApprenantEntity]),
    CryptageModule, NextcloudModule
  ],
  controllers: [WebinaireController],
  providers: [WebinaireService, CryptageService, NextcloudService],
})
export class WebinaireModule {}
