import { Request, Response, NextFunction, Router} from 'express';
import { wrapper } from '../src/wrap';
import { V1Deployment } from '@kubernetes/client-node';
import { Repos } from '../schemas/repo';
import { deployDeployment } from '../src/deployment';
import { deployService } from '../src/service';
import { deployIngress } from '../src/ingress';
import { readDeployment } from '../src/deployment';
import { parseRepo } from '../src/getRepo';
import { verifyUser } from '../src/jwt';

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
	const repoName = req.body['repoName'];
	const imageName = req.body['imageName'];
	const portNum = req.body['portNum'];
	const apiDoc = req.body['apiDoc'];
	const token = req.headers.authorization;
	try {
		if (token && repoName && imageName && portNum) {
			const user = verifyUser(token);
			const deployRes = await deployDeployment(user.id, repoName, imageName, portNum);
			await deployService(user.id, repoName, portNum);
			await deployIngress(user.id, repoName, portNum);
			await insertRepos(deployRes.body, apiDoc);
			const deployObject  = await readDeployment(user.id, repoName);
			const deployInfo = await parseRepo(user.id, deployObject);
			res.status(200).send(JSON.stringify(deployInfo));
		} else {
			res.status(401).send('Bad Request : Form data error');
		}
	} catch(err) {
		res.status(401).send(err);
	}
}));

module.exports = router;
