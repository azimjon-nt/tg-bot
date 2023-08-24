import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, mongo } from 'mongoose';

export type LocationDocument = HydratedDocument<Location>;

@Schema()
export class Location {
  @Prop({
    min: 3,
    max: 50,
    required: true,
  })
  name: string;

  @Prop({
    type: Number,
  })
  longitude: number;

  @Prop({
    type: Number,
  })
  latitude: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
