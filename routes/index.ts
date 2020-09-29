import { Router, NextFunction, Request, Response } from 'express';
import { k8sAppsV1Api } from '../src/config';
import { wrapper } from '../src/wrap';
import { parseRepos } from '../src/getRepo';
import { verifyUser } from '../src/jwt';

const router = Router();

/* GET Dashboard. */
router.get('/', wrapper(async (req : Request, res : Response, next : NextFunction) => {
  const namespace = req.query['namespace']?.toString();
  const token = req.headers.authorization;
  try {
    if (token && namespace) {
      const user = verifyUser(token).data.id.toString();
      const kuberRes = await k8sAppsV1Api.listNamespacedDeployment(user);
      const deploys = await parseRepos(user, kuberRes.body);
      res.status(200).send(JSON.stringify(deploys));
    } else {
      throw new Error("Login 필요");
    }
  } catch (err) {
    res.status(401).send(err);
  }
}));

module.exports = router;
