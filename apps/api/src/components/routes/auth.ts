import { Hono } from "hono";
import limiter from "../rateLimiter";
import { registrateUser } from "../auth/registartion";

const authRouter = new Hono();

authRouter.post("/registration", limiter(5), registrateUser);

export default authRouter;