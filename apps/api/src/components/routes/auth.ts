import { Hono } from "hono";
import limiter from "../middlewares/rateLimiter";
import { registrateUser } from "../auth/registartion";
import { loginUser } from "../auth/login";
import { getMe } from "../auth/authme";
import { clearSessionResponse } from "../auth/logout";
import { updateProfile } from "../auth/changeUserDatas";
import { deleteProfile } from "../auth/deleteAccount";

const authRouter = new Hono();

authRouter.post("/registration", limiter(5), registrateUser);
authRouter.post("/login", limiter(5), loginUser);
authRouter.get("/me", limiter(5), getMe)
authRouter.post("/logout", limiter(5), clearSessionResponse)
authRouter.patch("/profileChange", limiter(5), updateProfile)
authRouter.delete("/profileDelete", limiter(5), deleteProfile)

export default authRouter;