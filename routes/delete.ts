import { Request, Response, NextFunction, Router } from 'express';
import { wrapper } from '../src/wrap';
import { deleteDeployment } from '../src/deployment';
import { deleteService } from '../src/service';
import { deleteIngress } from '../src/ingress';
import { Repos } from '../schemas/repo';

const router = Router();

const deleteRepos = async(namespace: string, repoName: string) => {
	Repos.findOneAndDelete({
		namespace: namespace,
		repoName: repoName
	}).then((value) => {
		return Promise.resolve(200);
	}).catch((error) => {
		throw new Error(error);
	})
}

// TODO: delete 오류처리
router.delete('/:namespace/repo/:repoName', wrapper(async (req: Request, res: Response, next: NextFunction) => {
	const namespace = req.params.namespace;
	const repoName = req.params.repoName;
	if (namespace && repoName) {
		await deleteDeployment(namespace, repoName);
		await deleteService(namespace, repoName);
		await deleteIngress(namespace, repoName);
		await deleteRepos(namespace, repoName);
		res.status(200).send('Delete finished');
	} else {
		res.status(400).send('Namespace and reponame should be checked.');
	}
}))

module.exports = router;
