import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { User, type UserRole } from "../entities/user.entity";

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

  async countUsers(): Promise<number> {
    return this.userRepository.count();
  }

  async createUser(
    email: string,
    password: string,
    role: string = "admin",
  ): Promise<{ ok: true; user: AuthUser } | { ok: false; status: number; error: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { ok: false, status: 400, error: "El correo no es válido" };
    }
    if (!password || password.length < 8) {
      return { ok: false, status: 400, error: "La contraseña debe tener al menos 8 caracteres" };
    }
    if (role !== "admin" && role !== "editor") {
      return { ok: false, status: 400, error: "Rol no válido" };
    }

    const existing = await this.userRepository.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return { ok: false, status: 409, error: "Ese correo ya está registrado" };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const saved = await this.userRepository.save(
      this.userRepository.create({
        email: normalizedEmail,
        passwordHash,
        role: role as UserRole,
      }),
    );

    return {
      ok: true,
      user: { id: saved.id, email: saved.email, role: saved.role },
    };
  }
}

export const authService = new AuthService();
