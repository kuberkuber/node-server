import { Router, NextFunction, Request, Response } from 'express';
import { wrapper } from '../src/wrap';
import { updateDeployment } from '../src/deployment';
import { updateService } from '../src/service';
import { Repos } from '../schemas/repo';

const router = Router();

const updatePortRepos = (namespace: string, repoName: string, portNum: string) => {
	return new Promise((resolve, reject) => {
		Repos.findOneAndUpdate({
			namespace: namespace,
			repoName: repoName
		}, {
			portNum: portNum
		}).then((value) => resolve(value))
		.catch((error) => reject(error));
	});
}

// 포트변경
router.patch('/:namespace/repo/:repoName', wrapper(async(req: Request, res: Response, next: NextFunction) => {
	const namespace = req.params.namespace;
	const repoName = req.params.repoName;
	const portNum = req.body['portNum'];
	if (namespace && repoName && portNum) {
		await updateDeployment(namespace, repoName, portNum);
		await updateService(namespace, repoName, portNum);
		await updatePortRepos(namespace, repoName, portNum);
		res.status(200).send('PortNum changed');
	} else {
		res.status(400).send('Namespace,reponame and portNum should be checked.');
	}
}))

module.exports = router;
