import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "./category.entity";
import { ProductImage } from "./product-image.entity";

export type SaleMode = "UNIT_ONLY" | "PACKAGE_ONLY" | "BOTH";

@Entity({ name: "products" })
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120, unique: true })
  slug!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 80, nullable: true })
  sku!: string | null;

  @Column({ type: "varchar", length: 2000, nullable: true })
  description!: string | null;

  @Column({ name: "sale_mode", type: "varchar", length: 20, default: "BOTH" })
  saleMode!: SaleMode;

  @Column({ name: "category_id", type: "uuid" })
  categoryId!: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images!: ProductImage[];

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "is_featured", type: "boolean", default: false })
  isFeatured!: boolean;

  @Column({ name: "meta_title", type: "varchar", length: 255, nullable: true })
  metaTitle!: string | null;

  @Column({ name: "meta_description", type: "varchar", length: 500, nullable: true })
  metaDescription!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
