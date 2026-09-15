import "./config/load-env";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { loadRelayerEnv } from "./config/env";
import { RelayAttemptEntity } from "./entities/relay-attempt.entity";
import { RelayRequestEntity } from "./entities/relay-request.entity";
import { RelayModule } from "./relay/relay.module";

const env = loadRelayerEnv();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: env.databaseUrl,
      entities: [RelayRequestEntity, RelayAttemptEntity],
      synchronize: true,
      ...(env.databaseCa
        ? {
            ssl: {
              ca: env.databaseCa,
            },
          }
        : {}),
    }),
    RelayModule,
  ],
})
export class AppModule {}
