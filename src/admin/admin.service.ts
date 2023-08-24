import { Product } from 'src/product/schemas/product.schema';
import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Context, Markup, session } from 'telegraf';
import { keyboards } from 'src/enums/keyboard.enums';
import { AdminOnly } from 'src/decorators/onlyAdmin.decorator';
import errorHandler from 'src/decorators/errorHandler.decorator';
import { menus } from 'src/enums/menus.enum';
import { ProductService } from 'src/product/product.service';

@errorHandler
@AdminOnly()
@Injectable()
export class AdminService {
  constructor(private productService: ProductService) {}

  start(ctx: Context) {
    const keyboard = Markup.keyboard([keyboards.addProduct]).resize().oneTime();
    ctx.reply('Assalomu Aleykum admin xush kelibsiz!', keyboard);
  }

  addProduct(ctx: any) {
    ctx.session.menu = menus.addTitle;
    ctx.reply('Marhamat nomini kiriting: ');
  }

  async message(ctx: any) {
    const message = ctx.message.text;
    // task 1. add validation
    switch (ctx.session.menu) {
      case menus.addTitle: {
        ctx.session.product = {
          name: message,
        };
        ctx.session.menu = menus.addDescription;

        ctx.reply('Marhamat izoh kiriting:');
        return 0;
      }

      case menus.addDescription: {
        ctx.session.product.description = message;

        ctx.session.menu = menus.addPhoto;

        ctx.reply("Marhamat rasm jo'nating:");
        return 0;
      }

      case menus.addPhoto: {
        const photo = ctx.message.photo;

        ctx.session.product.photo_id = photo[0].file_id;

        ctx.session.menu = menus.addPrice;
        ctx.reply('Marhamat narxni kiriting:');
        return 0;
      }

      case menus.addPrice: {
        ctx.session.menu = null;

        ctx.session.product.price = parseInt(message);

        await this.productService.create(ctx.session.product);
        ctx.reply("Muvaffqaiyatli qo'shildi:");
        return 0;
      }
    }
  }
}
