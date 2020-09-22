import { Request, Response, NextFunction, Router } from 'express';
import { wrapper } from '../src/wrap';
import { deleteDeployment } from '../src/deployment';
import { deleteService } from '../src/service';
import { deleteIngress } from '../src/ingress';
import { Repos } from '../schemas/repo';
import { verifyUser } from '../src/jwt';

const router = Router();

const deleteRepos = (namespace: string, repoName: string) => {
	return new Promise((resolve, reject) => {
		Repos.findOneAndDelete({
			namespace: namespace,
			repoName: repoName
		}).then((value) => {
			if (value === null)
				throw new Error("No data to delete");
			return resolve(value);
		}).catch((error) => {
			console.log(error)
			return reject(error);
		})
	})
}

router.delete('/:namespace/repo/:repoName', wrapper(async (req: Request, res: Response, next: NextFunction) => {
	const repoName = req.params.repoName;
	const token = req.headers.authorization;
	try {
		if (token && repoName) {
			const user = verifyUser(token);
			await deleteDeployment(user.id, repoName);
			await deleteService(user.id, repoName);
			await deleteIngress(user.id, repoName);
			await deleteRepos(user.id, repoName);
			res.status(200).send('Delete finished');
		} else {
			res.status(400).send('reponame should be checked.');
		}
	} catch (err) {
		res.status(401).send(err);
	}
}))

module.exports = router;
