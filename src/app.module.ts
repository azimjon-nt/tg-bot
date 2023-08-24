import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { LocationModule } from './location/location.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import LocalSession = require('telegraf-session-local');
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.DB_URL),
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN,
      middlewares: [new LocalSession().middleware()], // middlewarega sessionni qo'shish
    }),
    UserModule,
    LocationModule,
    AdminModule,
    ProductModule,
    CategoryModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
