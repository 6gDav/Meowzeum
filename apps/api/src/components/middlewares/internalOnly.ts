import type { MiddlewareHandler } from "hono";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY!;

const internalOnly: MiddlewareHandler = async (c, next) => {
  if (c.req.header("x-internal-key") !== INTERNAL_KEY) {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }
  await next();
};

export default internalOnly;