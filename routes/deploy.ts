import { Request, Response, NextFunction, Router} from 'express';
import { wrapper } from '../src/wrap';
import { V1Deployment } from '@kubernetes/client-node';
import { Repos } from '../schemas/repo';
import { deployDeployment } from '../src/deployment';
import { deployService } from '../src/service';
import { deployIngress } from '../src/ingress';

const router = Router();

const insertRepos = (deployRepo: V1Deployment, apiDoc: JSON) => {
	return new Promise((resolve, reject) => {
		Repos.create({
			namespace : deployRepo.metadata?.namespace,
			repoName : deployRepo.metadata?.name,
			imageName : deployRepo.spec?.template.spec?.containers[0].image,
			portNum : deployRepo.spec?.template.spec?.containers[0].ports![0].containerPort,
			createdAt : deployRepo.metadata?.creationTimestamp,
			apiDoc: apiDoc,
		}).then((value) => {
			resolve(value)
		}).catch((err) => {
			reject(err);
		});
	});
}

router.post('/deploy', wrapper(async (req: Request, res: Response, next: NextFunction) => {
  const namespace = req.body['namespace'];
  const repoName = req.body['repoName'];
  const imageName = req.body['imageName'];
  const portNum = req.body['portNum'];
  const apiDoc = req.body['apiDoc'];
  console.log(typeof apiDoc);
  if (namespace && repoName && imageName && portNum) {
	const deployRes = await deployDeployment(namespace, repoName, imageName, portNum);
	await deployService(namespace, repoName, portNum);
	await deployIngress(namespace, repoName, portNum);
	await insertRepos(deployRes.body, apiDoc);
	res.status(200).send('Deploy finished');
  } else {
	res.status(400).send('Bad Request : Form data error');
  }
}));

module.exports = router;
