import { Module } from '@nestjs/common';
import { ApprenantModule } from './apprenant/apprenant.module';
import { WebinaireModule } from './webinaire/webinaire.module';
import { NextcloudModule } from './nextcloud/nextcloud.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprenantEntity } from './apprenant/entity/apprenant.entity';
import { WebinaireApprenantEntity } from './webinaire/entity/webinaire.entity';
import { CryptageModule } from './cryptage/cryptage.module';
import { ControleWebinaireEntity } from './webinaire/entity/controle-webinaire.entity';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }), 
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [ApprenantEntity, WebinaireApprenantEntity, ControleWebinaireEntity],
    synchronize: true,
  })
  ,ApprenantModule, WebinaireModule, NextcloudModule, CryptageModule, LoggerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
