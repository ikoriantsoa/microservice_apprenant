import { Module } from '@nestjs/common';
import { ApprenantService } from './apprenant.service';
import { ApprenantEntity } from './entity/apprenant.entity';
import { WebinaireApprenantEntity } from 'src/webinaire/entity/webinaire.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptageModule } from 'src/cryptage/cryptage.module';
import { CryptageService } from 'src/cryptage/cryptage.service';
import { ApprenantController } from './apprenant.controller';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprenantEntity, WebinaireApprenantEntity]),
    CryptageModule,
    LoggerModule
  ],
  providers: [ApprenantService, CryptageService],
  controllers: [ApprenantController],
})
export class ApprenantModule {}
