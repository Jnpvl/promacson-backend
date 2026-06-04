import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export type LoginResult =
  | { ok: true; token: string; user: AuthUser }
  | { ok: false; status: number; error: string };

function jwtSecret(): string {
  return process.env.JWT_SECRET || "dev-secret-change-me";
}

function jwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || "7d";
}

export class AuthService {
  private get userRepository(): Repository<User> {
    return AppDataSource.getRepository(User);
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return { ok: false, status: 401, error: "Credenciales incorrectas" };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { ok: false, status: 401, error: "Credenciales incorrectas" };
    }

    const expiresIn = jwtExpiresIn() as NonNullable<jwt.SignOptions["expiresIn"]>;
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      jwtSecret(),
      { expiresIn },
    );

    return {
      ok: true,
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;
    return { id: user.id, email: user.email, role: user.role };
  }
}

export const authService = new AuthService();
