import { Module } from '@nestjs/common';
import { EntryController } from './entry/entry.controller';
import { EntryService } from './entry/entry.service';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ],
  controllers: [
    EntryController,
    HealthController
  ],
  providers: [
    EntryService
  ],
})
export class AppModule {}
