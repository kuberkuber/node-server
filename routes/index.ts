import { Router, NextFunction, Request, Response } from 'express';
import { k8sAppsV1Api } from '../src/config';
import { wrapper } from '../src/wrap';
import { parseRepos } from '../src/getRepo';

const router = Router();

/* GET Dashboard. */
router.get('/', wrapper(async (req : Request, res : Response, next : NextFunction) => {
  const namespace = req.query['namespace']?.toString();
  console.log(req.headers);
  if (namespace != undefined)
  {
    const kuberRes = await k8sAppsV1Api.listNamespacedDeployment(namespace);
    const deploys = await parseRepos(namespace, kuberRes.body);
    res.status(200).send(JSON.stringify(deploys));
  } else {
    res.status(400).send('Bad Request : namespace should be specified');
  }
}));

module.exports = router;
