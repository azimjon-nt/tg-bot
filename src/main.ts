import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// 1. add validation
// 2. add admin panel
// 3. savatga qo'shish funksionalligi

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(process.env.DB_URL);
  await app.listen(3000);
}
bootstrap();
