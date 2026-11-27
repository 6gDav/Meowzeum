import type { MiddlewareHandler } from "hono";

const internalOnly: MiddlewareHandler = async (c, next) => {
  const internalKey = process.env.INTERNAL_API_KEY;
  if (!internalKey || c.req.header("x-internal-key") !== internalKey) {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }
  await next();
};

export default internalOnly;
