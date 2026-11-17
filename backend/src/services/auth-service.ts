import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { User } from "../../../shared/contracts";
import { AppError } from "../middleware/errors";
import type { TaskRepository } from "../repositories/task-repository";
import { invalid, object } from "./validation";

const derive = promisify(scrypt);
export const sessionHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export class AuthService {
  constructor(private repository: TaskRepository) {}
  private credentials(input: unknown) {
    const body = object(input, ["email", "password"]);
    if (
      typeof body.email !== "string" ||
      body.email.length > 254 ||
      body.email.includes("\u0000") ||
      !/^\S+@\S+\.\S+$/.test(body.email.trim())
    )
      throw invalid("Ingresá un correo válido.");
    if (
      typeof body.password !== "string" ||
      body.password.length < 4 ||
      body.password.length > 128
    )
      throw invalid("La contraseña debe tener entre 4 y 128 caracteres.");
    return { email: body.email.trim().toLowerCase(), password: body.password };
  }
  async register(input: unknown): Promise<{ user: User; token: string }> {
    const { email, password } = this.credentials(input);
    const salt = randomBytes(16).toString("hex");
    const hash = (await derive(password, salt, 64)) as Buffer;
    const user = { id: randomUUID(), email };
    const token = randomBytes(32).toString("hex");
    await this.repository.transaction(async (repo) => {
      await repo.addUser(user.id, email, `${salt}:${hash.toString("hex")}`);
      await repo.addSession(sessionHash(token), user.id);
    });
    return { user, token };
  }
  async login(input: unknown): Promise<{ user: User; token: string }> {
    const { email, password } = this.credentials(input);
    const found = await this.repository.findUser(email);
    const [salt, stored] = found?.passwordHash.split(":") ?? [
      "00000000000000000000000000000000",
      "00".repeat(64),
    ];
    const candidate = (await derive(password, salt, 64)) as Buffer;
    if (!found || !timingSafeEqual(candidate, Buffer.from(stored, "hex")))
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Correo o contraseña incorrectos.",
      );
    const token = randomBytes(32).toString("hex");
    await this.repository.addSession(sessionHash(token), found.id);
    return { user: { id: found.id, email: found.email }, token };
  }
  async current(token: unknown): Promise<User | null> {
    return typeof token === "string" && /^[a-f0-9]{64}$/.test(token)
      ? this.repository.session(sessionHash(token))
      : null;
  }
  async logout(token: unknown) {
    if (typeof token === "string")
      await this.repository.removeSession(sessionHash(token));
  }
}
