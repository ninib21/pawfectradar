import './loadEnv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function createApp() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors();

  // Add universal health endpoints
  const http = app.getHttpAdapter().getInstance();
  http.get('/health', (_req: any, res: any) => res.status(200).json({ ok: true }));
  http.get('/ready', (_req: any, res: any) => res.status(200).json({ ready: true }));

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  createApp().then(app => {
    const port = Number(process.env.PORT || 3001);
    app.listen(port).then(() => console.log(`API listening on :${port}`));
  });
}
