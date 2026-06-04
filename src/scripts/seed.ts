import "reflect-metadata";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";

dotenv.config();

export async function seedAdminUser(): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);
  const email = (process.env.ADMIN_EMAIL || "admin@promacson.local").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "changeme";
  const existing = await userRepo.findOne({ where: { email } });

  if (existing) {
    console.log(`[seed] Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = userRepo.create({
    email,
    passwordHash,
    role: "admin",
  });

  await userRepo.save(admin);
  console.log(`[seed] Created default admin user: ${email}`);
}

if (require.main === module) {
  initializeAndSeed()
    .then(() => AppDataSource.destroy())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

async function initializeAndSeed(): Promise<void> {
  await AppDataSource.initialize();
  await seedAdminUser();
}
