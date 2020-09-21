import { Router, NextFunction, Request, Response } from 'express';
import { k8sAppsV1Api } from '../src/config';
import { wrapper } from '../src/wrap';
import { parseRepos } from '../src/getRepo';

const jwt = require('jsonwebtoken');
const router = Router();

const verifyUser = (accessToken: string) => {
  const token = accessToken.split(' ')[1];
  if (token === undefined)
    throw new Error("Invalid JWT");
  const decoded = jwt.verify(token, 'jwtSecretKey');
  return decoded;
}

/* GET Dashboard. */
router.get('/', wrapper(async (req : Request, res : Response, next : NextFunction) => {
  const namespace = req.query['namespace']?.toString();
  // const token = req.headers.authorization;
  try {
    if (namespace) {
      // if (token && namespace) {
      // const user = verifyUser(token);
      const kuberRes = await k8sAppsV1Api.listNamespacedDeployment(namespace);
      const deploys = await parseRepos(namespace, kuberRes.body);
      res.status(200).send(JSON.stringify(deploys));
    } else {
      throw new Error("Login 필요");
    }
  } catch (err) {
    res.status(400).send(err);
  }
}));

module.exports = router;
