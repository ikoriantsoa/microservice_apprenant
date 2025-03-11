import { Controller } from '@nestjs/common';
import { ApprenantService } from './apprenant.service';
import { ICreateApprenant } from './entity/ICreateApprenant';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class ApprenantController {
    constructor(private readonly apprenantService: ApprenantService) {}

    @MessagePattern('createApprenant')
    public createApprenant(dataApprenant: ICreateApprenant) {
        return this.apprenantService.createApprenant(dataApprenant);
    }

}
