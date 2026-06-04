import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type WholesaleStatus = "NEW" | "CONTACTED" | "CLOSED";

@Entity({ name: "wholesale_inquiries" })
export class WholesaleInquiry {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  folio!: string | null;

  @Column({ type: "varchar", length: 20, default: "NEW" })
  status!: WholesaleStatus;

  @Column({ name: "client_type", type: "varchar", length: 40 })
  clientType!: string;

  @Column({ name: "client_type_other", type: "varchar", length: 120, nullable: true })
  clientTypeOther!: string | null;

  @Column({ type: "varchar", length: 255 })
  institution!: string;

  @Column({ name: "customer_name", type: "varchar", length: 255 })
  customerName!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 40, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  volume!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  interest!: string | null;

  @Column({ type: "text", nullable: true })
  message!: string | null;

  @Column({ name: "submitted_at", type: "timestamptz", nullable: true })
  submittedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
