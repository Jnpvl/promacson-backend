import "reflect-metadata";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";

dotenv.config();

export async function seedAdminUser(email: string, password: string): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await userRepo.findOne({ where: { email: normalizedEmail } });

  if (existing) {
    console.log(`[seed] El usuario ya existe: ${normalizedEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = userRepo.create({
    email: normalizedEmail,
    passwordHash,
    role: "admin",
  });

  await userRepo.save(admin);
  console.log(`[seed] Admin creado: ${normalizedEmail}`);
}

function parseArgs(): { email: string; password: string } {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const [email, password] = args;

  if (!email || !password) {
    console.error("Uso: npm run seed -- <email> <password>");
    process.exit(1);
  }

  return { email, password };
}

async function initializeAndSeed(): Promise<void> {
  const { email, password } = parseArgs();
  await AppDataSource.initialize();
  await seedAdminUser(email, password);
}

if (require.main === module) {
  initializeAndSeed()
    .then(() => AppDataSource.destroy())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
