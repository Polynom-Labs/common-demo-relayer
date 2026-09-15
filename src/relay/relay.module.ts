import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelayAttemptEntity } from '../entities/relay-attempt.entity';
import { RelayRequestEntity } from '../entities/relay-request.entity';
import { AdmissionService } from './admission.service';
import { ChainService } from './chain.service';
import { KytInspectService } from './kyt.service';
import { RelayController } from './relay.controller';
import { StatusService } from './status.service';
import { SubmitService } from './submit.service';

@Module({
  imports: [TypeOrmModule.forFeature([RelayRequestEntity, RelayAttemptEntity])],
  controllers: [RelayController],
  providers: [
    AdmissionService,
    StatusService,
    SubmitService,
    ChainService,
    KytInspectService,
  ],
})
export class RelayModule {}
