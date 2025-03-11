import { Module } from '@nestjs/common';
import { NextcloudService } from './nextcloud.service';

@Module({
  providers: [NextcloudService]
})
export class NextcloudModule {}
