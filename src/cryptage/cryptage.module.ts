import { Module } from '@nestjs/common';
import { CryptageService } from './cryptage.service';

@Module({
  providers: [CryptageService],
})
export class CryptageModule {}
