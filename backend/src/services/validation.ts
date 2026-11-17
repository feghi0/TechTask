import { AppError } from "../middleware/errors";

export function object(
  input: unknown,
  allowed: string[],
): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw invalid("Se esperaba un objeto JSON.");
  const body = input as Record<string, unknown>;
  if (Object.keys(body).some((key) => !allowed.includes(key)))
    throw invalid("La solicitud contiene campos no permitidos.");
  return body;
}
export function invalid(message: string): AppError {
  return new AppError(400, "VALIDATION_ERROR", message);
}
export function text(
  value: unknown,
  name: string,
  min: number,
  max: number,
): string {
  if (typeof value !== "string") throw invalid(`${name}: debe ser texto.`);
  if (value.includes("\u0000")) throw invalid(`${name}: contiene un carácter no permitido.`);
  const result = value.trim();
  if ([...result].length < min || [...result].length > max)
    throw invalid(`${name}: debe tener entre ${min} y ${max} caracteres.`);
  return result;
}
export function uuid(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw invalid("Identificador UUID inválido.");
  return value;
}
export function version(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1)
    throw invalid("Se requiere una versión entera positiva.");
  return value as number;
}
export function date(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.slice(0, 4) === "0000" ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  )
    throw invalid("La fecha debe existir y usar YYYY-MM-DD.");
  return value;
}
