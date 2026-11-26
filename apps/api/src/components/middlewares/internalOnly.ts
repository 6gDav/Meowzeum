import type { MiddlewareHandler } from "hono";

const INTERNAL_KEY = "CC0k/x0lwkYzOzDW6I1jKxqDHRmrYwb7T22oTUhiOYV8FG9P641GRzLRN6C6EDQA"//process.env.INTERNAL_API_KEY!;

const internalOnly: MiddlewareHandler = async (c, next) => {
  if (c.req.header("x-internal-key") !== INTERNAL_KEY) {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }
  await next();
};

export default internalOnly;