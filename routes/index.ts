import { Router, NextFunction, Request, Response } from 'express';
import { k8sAppsV1Api } from '../src/config';
import { wrapper } from '../src/wrap';
import { NLB_URL } from '../src/config';
import { V1DeploymentList } from '@kubernetes/client-node';
import { Repos } from '../schemas/repo';

const router = Router();

const getRepo = (namespace: string, repoName: string) : Promise<any> => {
  return new Promise((resolve, reject) => {
    Repos.findOne({
      namespace: namespace,
      repoName: repoName,
    }).exec().then((value) => {
      if (value === null)
        throw new Error("Resource exist. But not in DB.");
      resolve(value);
    }).catch((error) => {
      reject(error)
    });
  });
}

const parseRes = async(namespace: string, kuberRes : V1DeploymentList) => {
  let deploys: Array<{}> = [];

  for (const item of kuberRes['items']) {
    let itemDict: {[key: string]: string} = {};
    const metadata = item.metadata;
    const status = item.status;
    const container = item.spec?.template.spec?.containers[0]
    itemDict['image'] = container?.image!;
    itemDict['port'] = container?.ports![0].containerPort.toString() || '';
    itemDict['name'] = metadata?.name!;
    itemDict['status'] = status?.conditions![0].status || '';
    itemDict['endpoint'] = NLB_URL + '/' + namespace + '/' + itemDict['name'];
    // 재배포한 경우와 아닌 경우
    if (item.spec?.template.metadata?.annotations !== undefined){
      const redeployTime = item.spec.template.metadata.annotations['kubectl.kubernetes.io/restartedAt'];
      itemDict['deployTime'] = redeployTime;
    } else if (metadata?.creationTimestamp !== undefined) {
      itemDict['deployTime'] = metadata.creationTimestamp.toString();
    }
    await getRepo(namespace, itemDict['name']).then((value) => {
      if (value.get('apiDoc') !== undefined)
        itemDict['apiDoc'] = value.get('apiDoc');
    });
    deploys.push(itemDict);
  }
  return new Promise((resolve) => {
    resolve(deploys);
  });
}

/* GET Dashboard. */
router.get('/', wrapper(async (req : Request, res : Response, next : NextFunction) => {
  const namespace = req.query['namespace']?.toString();
  if (namespace != undefined)
  {
    const kuberRes = await k8sAppsV1Api.listNamespacedDeployment(namespace);
    const deploys = await parseRes(namespace, kuberRes.body);
    res.status(200).send(JSON.stringify(deploys));
  } else {
    res.status(400).send('Bad Request : namespace should be specified');
  }
}));

module.exports = router;
