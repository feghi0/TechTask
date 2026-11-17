import type { ErrorRequestHandler } from "express";
export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    res
      .status(error.status)
      .json({
        error: {
          code: error.code,
          message: error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        },
      });
    return;
  }
  if (
    error instanceof URIError ||
    (error instanceof SyntaxError && "body" in error)
  ) {
    res
      .status(400)
      .json({
        error: {
          code: "INVALID_REQUEST",
          message: "La solicitud no es válida.",
        },
      });
    return;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    res
      .status(413)
      .json({
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "La solicitud es demasiado grande.",
        },
      });
    return;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    res
      .status(409)
      .json({
        error: { code: "DUPLICATE_RECORD", message: "El registro ya existe." },
      });
    return;
  }
  console.error(
    error instanceof Error
      ? { name: error.name, message: error.message }
      : "Unexpected server error",
  );
  res
    .status(500)
    .json({
      error: {
        code: "INTERNAL_ERROR",
        message: "No se pudo completar la operación.",
      },
    });
};
