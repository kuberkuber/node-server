import { Router, NextFunction, Request, Response } from "express";
import { k8sCoreV1Api } from "./config";
import { wrapper } from "./wrap";

const router = Router();

/* GET Dashboard. */
router.get('/', wrapper(async (req : Request, res : Response, next : NextFunction)  => {
  const kuberRes = await k8sCoreV1Api.listNamespacedPod('test');
  res.status(200).json(kuberRes);
}));

module.exports = router;
