import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Mongoose, Types } from 'mongoose';
export type OrderDocument = HydratedDocument<Order>;

@Schema({
  timestamps: true,
})
export class Order {
  @Prop()
  paymentId: number;

  @Prop({
    ref: 'user',
    type: Types.ObjectId,
  })
  user: string;

  @Prop({
    ref: 'product',
    type: Types.ObjectId,
  })
  product: string;

  @Prop({
    ref: 'location',
    type: Types.ObjectId,
  })
  location: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
