import { Request, Response, NextFunction, Router} from 'express';
import { wrapper } from '../src/wrap';
import { redeployDeployment } from '../src/deployment';
import { verifyUser } from '../src/jwt';

const router = Router();

router.post('/:namespace/repo/:repoName/redeploy', wrapper(async (req: Request, res: Response, next: NextFunction) => {
	const repoName = req.params.repoName;
	const token = req.headers.authorization;
	try {
		if (token && repoName) {
			const user = verifyUser(token);
			await redeployDeployment(user.id, repoName);
			res.status(200).send('Redeploy finished');
		} else {
			res.status(401).send('Bad Request : Form data error');
		}
	} catch(err) {
		res.status(401).send(err);
	}

}));

module.exports = router;
