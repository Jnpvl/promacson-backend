import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product } from "./product.entity";
import { Quote } from "./quote.entity";

@Entity({ name: "quote_lines" })
export class QuoteLine {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "quote_id", type: "uuid" })
  quoteId!: string;

  @ManyToOne(() => Quote, (quote) => quote.lines, { onDelete: "CASCADE" })
  @JoinColumn({ name: "quote_id" })
  quote!: Quote;

  @Column({ name: "product_id", type: "uuid" })
  productId!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ name: "product_name", type: "varchar", length: 255 })
  productName!: string;

  @Column({ name: "product_slug", type: "varchar", length: 120 })
  productSlug!: string;

  @Column({ name: "sale_mode_label", type: "varchar", length: 40 })
  saleModeLabel!: string;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
