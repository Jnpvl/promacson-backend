import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { QuoteLine } from "./quote-line.entity";

export type QuoteStatus = "NEW" | "QUOTE_SENT" | "PURCHASED";

@Entity({ name: "quotes" })
export class Quote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  folio!: string | null;

  @Column({ type: "varchar", length: 20, default: "NEW" })
  status!: QuoteStatus;

  @Column({ name: "customer_name", type: "varchar", length: 255 })
  customerName!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 40, nullable: true })
  phone!: string | null;

  @Column({ name: "submitted_at", type: "timestamptz", nullable: true })
  submittedAt!: Date | null;

  @OneToMany(() => QuoteLine, (line) => line.quote, { cascade: true })
  lines!: QuoteLine[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
