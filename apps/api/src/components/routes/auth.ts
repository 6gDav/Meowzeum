import { Hono } from "hono";
import limiter from "../middlewares/rateLimiter";
import { registrateUser } from "../auth/registartion";
import { loginUser } from "../auth/login";
import { getMe } from "../auth/authme";

const authRouter = new Hono();

authRouter.post("/registration", limiter(5), registrateUser);
authRouter.post("/login", limiter(5), loginUser);
authRouter.post("/me", limiter(5), getMe)

export default authRouter;