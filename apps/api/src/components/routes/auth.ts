import { Hono } from "hono";
import limiter from "../middlewares/rateLimiter";
import { registrateUser } from "../auth/registartion";
import { loginUser } from "../auth/login";
import { getMe } from "../auth/authme";
import { clearSessionResponse } from "../auth/logout";

const authRouter = new Hono();

authRouter.post("/registration", limiter(5), registrateUser);
authRouter.post("/login", limiter(5), loginUser);
authRouter.get("/me", limiter(5), getMe)
authRouter.post("logout", limiter(5), clearSessionResponse)

export default authRouter;