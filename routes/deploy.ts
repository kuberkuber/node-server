import { Request, Response, NextFunction, Router} from 'express';
import { wrapper } from '../src/wrap';
import { V1Deployment } from '@kubernetes/client-node';
import repoTable from '../schemas/repo';
import { deployDeployment } from '../src/deployment';

const router = Router();

const insertRepoTable = async(deployRepo: V1Deployment, apiDoc: JSON) => {
	repoTable.create({
		namespace : deployRepo.metadata?.namespace,
		repoName : deployRepo.metadata?.name,
		imageName : deployRepo.spec?.template.spec?.containers[0].image,
		portNum : deployRepo.spec?.template.spec?.containers[0].ports![0].containerPort,
		createdAt : deployRepo.metadata?.creationTimestamp,
		endpointFile: apiDoc,
	}).then(() => {
		return Promise.resolve(200);
	}).catch((Error) => {
		return Promise.reject(new Error(400));
	})
}

router.post('/deploy', wrapper(async (req: Request, res: Response, next: NextFunction) => {
  const namespace = req.body['namespace'];
  const repoName = req.body['repoName'];
  const imageName = req.body['imageName'];
  const portNum = req.body['portNum'];
  const apiDoc = req.body['apiDoc'];
  if (namespace && repoName && imageName && portNum) {
	const deployRes = await deployDeployment(namespace, repoName, imageName, portNum);
	await insertRepoTable(deployRes.body, apiDoc);
	res.status(200).send('deploy finished');
  } else {
	res.status(400).send('Bad Request : form data error');
  }
}));

module.exports = router;
