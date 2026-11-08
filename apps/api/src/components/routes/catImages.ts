import { Hono } from "hono";
import getCatPictures from "../images/catImageFinder";
import getCatPictures2 from "../images/catImageFinder2"
import limiter from "../rateLimiter";

const catImagesRouter = new Hono();

catImagesRouter.get('/', limiter(3), async (c) => {
  return c.text("Meowzeum API. Try these routes: /get-a-cat-image, /get-a-cat-info/Ragdoll, /get-a-cat-info-datail/get-all-names/, get-a-cat-info-datail/Ragdoll/lifespan");
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