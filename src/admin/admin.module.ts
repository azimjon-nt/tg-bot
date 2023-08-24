import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [ProductModule],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
