import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import animeRouter from "./anime.js";
import searchRouter from "./search.js";
import latestRouter from "./latest.js";
import proxyRouter from "./proxy.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/anime", animeRouter);
router.use("/search", searchRouter);
router.use("/latest", latestRouter);
router.use("/proxy", proxyRouter);

export default router;
