import type { ErrorRequestHandler } from 'express';
export class AppError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string,string>) {super(message);}
}
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof AppError) {res.status(error.status).json({error:{code:error.code,message:error.message,...(error.fields ? {fields:error.fields}: {})}}); return;}
  if (error instanceof SyntaxError && 'body' in error) {res.status(400).json({error:{code:'INVALID_JSON',message:'El cuerpo JSON no es válido.'}});return;}
  if (typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large') {res.status(413).json({error:{code:'PAYLOAD_TOO_LARGE',message:'La solicitud es demasiado grande.'}});return;}
  console.error(error);
  res.status(500).json({error:{code:'INTERNAL_ERROR',message:'No se pudo completar la operación.'}});
};
