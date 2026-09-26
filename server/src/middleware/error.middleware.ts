import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (_request, response) => { response.status(404).json({ success: false, message: "Route not found" }); };
export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => { const message = error instanceof Error ? error.message : "An unexpected error occurred"; response.status(500).json({ success: false, message }); };
