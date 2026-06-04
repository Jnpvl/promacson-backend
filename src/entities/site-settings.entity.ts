import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "site_settings" })
export class SiteSettings {
  @PrimaryColumn({ type: "varchar", length: 20, default: "default" })
  id!: string;

  @Column({ type: "varchar", length: 40 })
  phone!: string;

  @Column({ name: "phone_e164", type: "varchar", length: 20 })
  phoneE164!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 20 })
  whatsapp!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  address!: string | null;

  @Column({ name: "business_hours", type: "varchar", length: 255, nullable: true })
  businessHours!: string | null;

  @Column({ name: "facebook_url", type: "varchar", length: 500, nullable: true })
  facebookUrl!: string | null;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
