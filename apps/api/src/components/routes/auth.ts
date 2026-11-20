import { Hono } from "hono";
import limiter from "../rateLimiter";
import { registrateUser } from "../auth/registartion";
import { loginUser } from "../auth/login";

const authRouter = new Hono();

authRouter.post("/registration", limiter(5), registrateUser);
authRouter.post("/login", limiter(5), loginUser);

export default authRouter;