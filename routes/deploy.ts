import { Request, Response, NextFunction, Router} from 'express';
import { wrapper } from '../src/wrap';
import { V1Deployment } from '@kubernetes/client-node';
import { Repos } from '../schemas/repo';
import { deployDeployment } from '../src/deployment';
import { deployService } from '../src/service';
import { deployIngress } from '../src/ingress';

const router = Router();

const insertRepos = async(deployRepo: V1Deployment, apiDoc: JSON) => {
	Repos.create({
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

// TODO: 배포 오류처리하기
router.post('/deploy', wrapper(async (req: Request, res: Response, next: NextFunction) => {
  const namespace = req.body['namespace'];
  const repoName = req.body['repoName'];
  const imageName = req.body['imageName'];
  const portNum = req.body['portNum'];
  const apiDoc = req.body['apiDoc'];
  if (namespace && repoName && imageName && portNum) {
	const deployRes = await deployDeployment(namespace, repoName, imageName, portNum);
	await deployService(namespace, repoName, portNum);
	await deployIngress(namespace, repoName, portNum);
	await insertRepos(deployRes.body, apiDoc).then(() => {
		Repos.find({}, (err, result) => {
			console.log(result);
		});
	});
	res.status(200).send('deploy finished');
  } else {
	res.status(400).send('Bad Request : form data error');
  }
}));

module.exports = router;
