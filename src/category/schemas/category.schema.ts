import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  @Prop({
    min: 3,
    max: 50,
    required: true,
  })
  name: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'category',
  })
  parentCategory: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
