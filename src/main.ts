import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 7000;
  if (process.env.NODE_ENV === "production") {
    await app.listen(port, "0.0.0.0");
  } else {
    await app.listen(port);
  }
  await app.listen(process.env.PORT ?? 7000);
}
export default bootstrap();
