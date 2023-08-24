import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from 'src/product/schemas/product.schema';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  findAll() {
    return this.productModel.find().populate({
      path: 'owner',
      populate: {
        path: 'location',
        model: Location.name,
      },
    });
  }

  findOne(id: string) {
    return this.productModel.findById(id);
  }

  findByCategoryId(categoryId: ObjectId, page = 1, limit = 10) {
    return this.productModel
      .find({
        category: categoryId,
      })
      .limit(limit)
      .skip((page - 1) * limit);
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
