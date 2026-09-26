import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => { console.info(`Fitness Platform API listening on port ${env.port}`); });
