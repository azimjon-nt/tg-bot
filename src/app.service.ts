import { LocationService } from './location/location.service';
import { OrderService } from './order/order.service';
import { Action, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { keyboards } from './enums/keyboard.enums';
import { getDistance } from './utils/get-distance.utils';
import { UserService } from 'src/user/user.service';
import { isAdmin } from 'src/utils/is-admin';
import { AdminService } from 'src/admin/admin.service';
import errorHandler from 'src/decorators/errorHandler.decorator';
import { CategoryService } from 'src/category/category.service';
import { ProductService } from 'src/product/product.service';

@errorHandler
@Update()
export class AppService {
  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private locationService: LocationService,
    private orderService: OrderService,
  ) {}

  @Start()
  start(@Ctx() ctx: any) {
    const id = ctx.from.id;
    console.log(ctx.session.user_id);
    if (isAdmin(id)) {
      return this.adminService.start(ctx);
    }

    if (ctx.session.user_id) {
      return this.mainMenu(ctx);
    }

    const keyboard = Markup.keyboard([keyboards.register, keyboards.support])
      .resize()
      .oneTime();

    ctx.reply('salom', keyboard);
  }

  @Hears(keyboards.register)
  register(@Ctx() ctx: Context) {
    const keyboard = Markup.keyboard([
      Markup.button.contactRequest(keyboards.contact),
    ])
      .resize()
      .oneTime();
    ctx.reply(
      "Marhamat telefon raqamingizni yuborgan holatda ro'yhatdan o'ting!",
      keyboard,
    );
  }

  @Hears(keyboards.support)
  support(@Ctx() ctx: any) {
    ctx.reply('Savolingizni kiriting');
  }

  @Hears(keyboards.addProduct)
  addProduct(@Ctx() ctx: any) {
    const id = ctx.from.id;

    if (!isAdmin(id)) {
      ctx.reply('not authorized to add product');
    }

    this.adminService.addProduct(ctx);
  }

  @On('contact')
  async contact(@Ctx() ctx: any) {
    const phoneNumber = ctx.update.message.contact.phone_number;

    const user = ctx.update.message.from;

    // idni olib tashlash uchun
    const id = user.id;
    user.id = undefined;

    const newUser = await this.userService.create({
      tg_id: id,
      phone_number: phoneNumber,
      ...user,
    });

    console.log(newUser._id, 'sq');

    ctx.session.user_id = newUser._id.toString();

    const keyboard = Markup.keyboard([
      Markup.button.locationRequest(keyboards.location),
    ])
      .resize()
      .oneTime();

    console.log(phoneNumber);

    ctx.reply('Endi joylashuvingizni yuboring:', keyboard);
  }

  @On('location')
  async location(@Ctx() ctx: any) {
    try {
      const location = ctx.update.message.location;
      const branches: any = await this.locationService.findAll();

      const nearestBranch = branches.reduce(
        (acc: any, branch: any, index: number) => {
          const distance = getDistance(
            branch.latitude,
            location.latitude,
            branch.longitude,
            location.longitude,
          );

          console.log(branch.name, '=', distance);

          if (!acc) {
            return {
              branchIndex: index,
              distance,
            };
          }

          if (distance < acc.distance)
            return {
              branchIndex: index,
              distance,
            };

          return acc;
        },
        null,
      );

      console.log(ctx.update.message, branches[nearestBranch?.branchIndex]);

      ctx.telegram.sendLocation(
        ctx.update.message.chat.id,
        branches[nearestBranch?.branchIndex].longitude,
        branches[nearestBranch?.branchIndex].latitude,
      );

      ctx.session.location_id = branches[nearestBranch?.branchIndex]._id;
      return this.mainMenu(ctx);
    } catch (err) {
      console.log(err);
    }
  }

  mainMenu(ctx: any) {
    const keyboard = Markup.keyboard([keyboards.buyProduct, keyboards.support])
      .resize()
      .oneTime();

    ctx.reply('Marhamat menyulardan birini tanlang:', keyboard);
  }

  @Hears(keyboards.buyProduct)
  async buyProduct(ctx: any) {
    const categories: any = await this.categoryService.findAll();

    const keyboard = Markup.inlineKeyboard(
      categories.map((item) => ({
        text: item.name,
        callback_data: 'category-' + item._id,
      })),
    );

    ctx.reply('Marhamat kategoriyalardan birini tanlang: ', keyboard);
  }

  @Action(/^category-.+/)
  async handleGetProducts(ctx: any) {
    console.log('1111');

    const action = ctx.callbackQuery.data.split('-')[1];
    ctx.deleteMessage(ctx.update.callback_query.message.message_id);
    ctx.session.current_category_id = action;
    return this.getProducts(ctx);
  }

  @Action(/^skip-.+/)
  async pagination(ctx: any) {
    const page = parseInt(ctx.callbackQuery.data.split('-')[1]);
    if (page < 1) return;

    console.log('pg', ctx?.update.callback_query?.message.message_id, page);

    ctx.deleteMessage(ctx.update.callback_query.message.message_id);

    this.getProducts(ctx, page);
  }

  async getProducts(ctx: any, page = 1) {
    const categoryId = ctx.session.current_category_id;

    const products = await this.productService.findByCategoryId(
      categoryId,
      page,
    );
    const productsButton = products.reduce((acc, item, index) => {
      if (index % 2 === 0) {
        acc.push([
          {
            text: item.name,
            callback_data: 'product-' + item._id,
          },
        ]);
      } else {
        acc[acc.length - 1][1] = {
          text: item.name,
          callback_data: 'product-' + item._id,
        };
      }
      return acc;
    }, []);

    const keyboard = Markup.inlineKeyboard([
      ...productsButton,
      [
        Markup.button.callback('<<', 'skip-' + (page - 1)),
        {
          text: '>>',
          callback_data: 'skip-' + (page + 1),
        },
      ],
      [
        {
          text: 'Kategoriyaga qaytish',
          callback_data: 'back_category',
        },
      ],
    ]);

    ctx.reply('Marhamat mahsulotlardan birini tanlang: ', keyboard);
  }

  @Action(/^product-.+/)
  async getProduct(ctx: any) {
    const action = ctx.callbackQuery.data.split('-')[1];
    const product = await this.productService.findOne(action);

    const keyboard = Markup.inlineKeyboard([
      {
        text: 'Sotib olish',
        callback_data: 'buy-' + product._id,
      },
      {
        text: "Savatga qo'shish",
        callback_data: 'cart-' + product._id,
      },
    ]);

    const message = `${product.name}

${product.description}

💰 ${product.price}`;

    ctx.telegram.sendPhoto(ctx.chat.id, product.photo_id, {
      caption: message,
      parse_mode: 'MarkdownV2',
      reply_markup: keyboard.reply_markup,
    });
  }

  @Action(/^buy-.+/)
  async buy(ctx: any) {
    const action = ctx.callbackQuery.data.split('-')[1];
    console.log(2222);
    const product = await this.productService.findOne(action);

    ctx.session.product_id = product._id;
    ctx.telegram.sendInvoice(ctx.chat.id, {
      provider_token: process.env.PAYMENT_METHOD_TOKEN,
      currency: 'UZS',
      prices: [
        {
          label: "To'lov",
          amount: product.price * 1000,
        },
      ],
      title: product.name,
      description: product.description,
      payload: product._id,
    });
  }

  @On('pre_checkout_query')
  async preCheckout(ctx: any) {
    console.log(ctx);

    const newOrder = await this.orderService.create({
      product: ctx.session.product_id,
      user: ctx.session.user_id,
      paymentId: ctx.update.pre_checkout_query.id,
      location: ctx.session.location_id,
    });

    const user = await this.userService.findOne(ctx.session.user_id);
    console.log('ss', ctx.session.user_id, user);

    console.log(ctx.update.pre_checkout_query.payload);

    const product = await this.productService.findOne(ctx.session.product_id);
    const location = await this.locationService.findOne(
      ctx.session.location_id,
    );

    const message = `Buyurtma qabul qilindi:
Mijoz malumotlari: ${user?.first_name} ${user?.last_name}
telefon: ${user?.phone_number}

Mahsulot malumotlari: ${product?.name},
narxi: ${product?.price} so'm

Filial: ${location?.name}
`;

    ctx.telegram.sendMessage(5066709830, message);

    ctx.telegram.answerPreCheckoutQuery(ctx.update.pre_checkout_query.id, true);
  }

  @Action('success_payment')
  successPayment(ctx: any) {}

  @On('message')
  async message(ctx: any) {
    console.log(ctx.from.id);

    // ctx.telegram.sendMessage(ctx.from.id, ctx.message.text);

    const id = ctx.from.id;
    if (isAdmin(id)) {
      return this.adminService.message(ctx);
    }
  }
}
