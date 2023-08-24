import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Mongoose, Types } from 'mongoose';
import { Location as Loc } from 'src/location/schemas/location.schema';
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({
    type: Number,
  })
  tg_id: number;

  @Prop()
  is_bot: boolean;

  @Prop({
    min: 3,
    max: 50,
    required: true,
  })
  first_name: string;

  @Prop()
  last_name: string;

  @Prop()
  phone_number: string;

  @Prop()
  username: string;

  @Prop({
    ref: 'Location',
    type: Types.ObjectId,
  })
  location: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
