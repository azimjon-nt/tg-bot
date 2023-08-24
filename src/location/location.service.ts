import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from 'src/location/schemas/location.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name) private readonly locationModel: Model<Location>,
  ) {}

  create(createLocationDto: CreateLocationDto) {
    return this.locationModel.create(createLocationDto);
  }

  findAll() {
    return this.locationModel.find({});
  }

  findOne(id: string) {
    return this.locationModel.findById(id);
  }
}
