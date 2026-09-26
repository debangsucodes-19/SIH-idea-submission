import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { healthRouter } from "./routes/health.routes.js";

export const app = express();
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use("/api", healthRouter);
app.use(notFoundHandler);
app.use(errorHandler);
