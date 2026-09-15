import 'reflect-metadata';
import './config/load-env';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';
import { loadRelayerEnv } from './config/env';

async function bootstrap(): Promise<void> {
  const env = loadRelayerEnv();
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '2mb' }));
  await app.listen(env.port);
}

void bootstrap();
