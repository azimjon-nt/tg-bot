import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({
    min: 3,
    max: 50,
    required: true,
    type: String,
  })
  name: string;

  @Prop({
    required: true,
    type: String,
  })
  description: string;

  @Prop({
    required: true,
    type: String,
  })
  photo_id: string;

  @Prop({
    required: true,
    type: Number,
  })
  price: number;

  @Prop({
    ref: User.name,
    type: mongoose.Types.ObjectId,
  })
  owner: ObjectId;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'category',
  })
  category: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
