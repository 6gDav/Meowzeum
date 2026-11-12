import { Hono } from "hono";
import getCatPictures from "../images/catImageFinder";
import getCatPictures2 from "../images/catImageFinder2"
import limiter from "../rateLimiter";

const catImagesRouter = new Hono();

catImagesRouter.get('/', limiter(3), async (c) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="hu">
    <head>
        <meta charset="UTF-8">
        <title>Meowzeum API</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding-top: 50px; background: #fdf6e2; }
          h1 { color: #d97706; }
          ul { list-style: none; padding: 0; }
          li { margin: 10px 0; }
          a { color: #b45309; text-decoration: none; font-weight: bold; }
          a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <h1>Hello in Meowzeum API</h1>
        <p>Try these routes</p>
        <ul>
          <li><a href="/get-a-cat-image">/get-a-cat-image</a></li>
          <li><a href="/get-a-cat-info/Ragdoll">/get-a-cat-info/Ragdoll</a></li>
          <li><a href="/get-a-cat-info-datail/get-all-names/">/get-a-cat-info-datail/get-all-names/</a></li>
          <li><a href="/get-a-cat-info-datail/Ragdoll/lifespan">/get-a-cat-info-datail/Ragdoll/lifespan</a></li>
        </ul>
    </body>
    </html>
  `;

  return c.html(htmlContent);
});

catImagesRouter.get('/get-a-cat-image', limiter(6), async (c) => {
  let images = await getCatPictures();

  if (!images || images.length === 0) {
    images = await getCatPictures2();
  }
  if (!images || images.length === 0) {
    return c.json(
      {
        success: false,
        message: `Error occured while tring to fetch cat images`
      },
      500
    );
  }
  return c.json(images);
});

export default catImagesRouter;