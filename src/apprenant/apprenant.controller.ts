import { Body, Controller } from '@nestjs/common';
import { ApprenantService } from './apprenant.service';
import { ICreateApprenant } from './entity/ICreateApprenant';
import { MessagePattern } from '@nestjs/microservices';
import { LoggerService } from '../logger/logger.service';

@Controller()
export class ApprenantController {
  constructor(
    private readonly apprenantService: ApprenantService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ApprenantController.name);
  }

  @MessagePattern('createApprenant')
  public createApprenant(@Body() dataApprenant: ICreateApprenant) {
    this.logger.log(`Contrôleur pour créer un nouveu apprenant`);
    return this.apprenantService.createApprenant(dataApprenant);
  }
}
