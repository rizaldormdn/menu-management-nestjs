import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import express, { Express } from "express";

let cachedApp: Express | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 8000);
}

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp)
  );

  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

export default async (req: any, res: any) => {
  const app = await createApp();
  return app(req, res);
};

// Jalankan server normal jika bukan di Vercel
if (process.env.VERCEL !== "1") {
  bootstrap().catch(console.error);
}
