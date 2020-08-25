import { Request, Response, NextFunction, Router} from 'express';
import { wrapper } from '../src/wrap';
import { redeployDeployment } from '../src/deployment';

const router = Router();

router.post('/:namespace/repo/:repoName/redeploy', wrapper(async (req: Request, res: Response, next: NextFunction) => {
	const namespace = req.params.namespace;
	const repoName = req.params.repoName;
	if (namespace && repoName) {
		await redeployDeployment(namespace, repoName);
		res.status(200).send('Redeploy finished');
	} else {
		res.status(400).send('Bad Request : Form data error');
	}
}));

module.exports = router;
