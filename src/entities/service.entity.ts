import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "services" })
export class Service {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120, unique: true })
  slug!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 4000, nullable: true })
  body!: string | null;

  @Column({ name: "image_url", type: "varchar", length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ name: "external_href", type: "varchar", length: 500, nullable: true })
  externalHref!: string | null;

  @Column({ name: "contact_type", type: "varchar", length: 20, nullable: true })
  contactType!: "phone" | "email" | "whatsapp" | null;

  @Column({ name: "contact_value", type: "varchar", length: 255, nullable: true })
  contactValue!: string | null;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "meta_title", type: "varchar", length: 255, nullable: true })
  metaTitle!: string | null;

  @Column({ name: "meta_description", type: "varchar", length: 500, nullable: true })
  metaDescription!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
