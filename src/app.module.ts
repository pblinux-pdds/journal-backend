import { Module } from '@nestjs/common';
import { EntryController } from './entry/entry.controller';
import { EntryService } from './entry/entry.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ],
  controllers: [EntryController],
  providers: [EntryService],
})
export class AppModule {}
