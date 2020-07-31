import { Router, NextFunction, Request, Response } from "express";
import { k8sAppsV1Api } from "./config";
import { wrapper } from "./wrap";

const router = Router();
const NLB_URL = "http://kuberkuber-cluster-bace65abd86cb82e.elb.ap-northeast-2.amazonaws.com"

/* GET Dashboard. */
router.get('/', wrapper(async (req : Request, res : Response, next : NextFunction)  => {
  const namespace = req.query['namespace'];
  if (namespace != undefined)
  {
    const kuberRes = await k8sAppsV1Api.listNamespacedDeployment('test');
    let deploys: Array<{}> = [];
    for (const item of kuberRes.body['items']) {
      let itemDict: {[key: string]: string} = {};
      const metadata = item.metadata;
      const status = item.status;
      const container = item.spec?.template.spec?.containers[0]
      itemDict['image'] = container?.image!;
      itemDict['port'] = container?.ports![0].containerPort.toString() || '';
      itemDict['name'] = metadata?.name!;
      itemDict['status'] = status?.conditions![0].status || '';
      itemDict['endpoint'] = NLB_URL + '/' + namespace + '/' + itemDict['name'];
      deploys.push(itemDict);
    }
    res.status(200).send(JSON.stringify(deploys));
  } else {
    res.status(400).send('Bad Request : namespace should be specify');
  }
}));

module.exports = router;
