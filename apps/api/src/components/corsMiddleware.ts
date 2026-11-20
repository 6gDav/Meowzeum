import { cors } from "hono/cors";

const PRODUCTION_ORIGIN = "https://meowzeum-henna.vercel.app";

const LOCAL_ORIGIN_REGEX = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

const isAllowedOrigin = (origin: string): boolean =>
  origin === PRODUCTION_ORIGIN || LOCAL_ORIGIN_REGEX.test(origin);

const authCors = cors({
  origin: (origin) => (isAllowedOrigin(origin) ? origin : null),
  credentials: true,
  allowMethods: ["POST", "GET", "POST", "PUT", "DELETE"], 
  allowHeaders: ["Content-Type"],
  maxAge: 86400,
});

export default authCors;