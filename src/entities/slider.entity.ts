import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "sliders" })
export class Slider {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "varchar", length: 120, nullable: true })
  eyebrow!: string | null;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description!: string | null;

  @Column({ name: "image_url", type: "varchar", length: 500 })
  imageUrl!: string;

  @Column({ name: "has_primary_cta", type: "boolean", default: false })
  hasPrimaryCta!: boolean;

  @Column({ name: "primary_cta_label", type: "varchar", length: 120, nullable: true })
  primaryCtaLabel!: string | null;

  @Column({ name: "primary_cta_href", type: "varchar", length: 255, nullable: true })
  primaryCtaHref!: string | null;

  @Column({ name: "has_secondary_cta", type: "boolean", default: false })
  hasSecondaryCta!: boolean;

  @Column({ name: "secondary_cta_label", type: "varchar", length: 120, nullable: true })
  secondaryCtaLabel!: string | null;

  @Column({ name: "secondary_cta_href", type: "varchar", length: 255, nullable: true })
  secondaryCtaHref!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
