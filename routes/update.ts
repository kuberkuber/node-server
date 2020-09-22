import { Router, NextFunction, Request, Response } from 'express';
import { wrapper } from '../src/wrap';
import { updateDeployment } from '../src/deployment';
import { updateService } from '../src/service';
import { Repos } from '../schemas/repo';
import { verifyUser } from '../src/jwt';

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
	const token = req.headers.authorization;
	const repoName = req.params.repoName;
	const portNum = req.body['portNum'];
	try {
		if (token && repoName && portNum) {
			const user = verifyUser(token);
			await updateDeployment(user.id, repoName, portNum);
			await updateService(user.id, repoName, portNum);
			await updatePortRepos(user.id, repoName, portNum);
			res.status(200).send('PortNum changed');
		} else {
			res.status(401).send('Namespace,reponame and portNum should be checked.');
		}
	} catch (err) {
		res.status(401).send(err);
	}
}))

module.exports = router;
