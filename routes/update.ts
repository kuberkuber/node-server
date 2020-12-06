import { Router, NextFunction, Request, Response } from 'express';
import { wrapper } from '../src/wrap';
import { updateDeployment } from '../src/deployment';
import { updateService } from '../src/service';
import { Repos } from '../schemas/repo';
import { verifyUser } from '../src/jwt';
import { readDeployment } from '../src/deployment';
import { parseRepo } from '../src/getRepo';

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
router.patch('/:namespace/repo/:repoName/port', wrapper(async(req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization;
	const repoName = req.params.repoName;
	const portNum = req.body['portNum'];
	try {
		if (token && repoName && portNum) {
			const namespace = verifyUser(token).data.id.toString();
			await updateDeployment(namespace, repoName, portNum);
			await updateService(namespace, repoName, portNum);
			await updatePortRepos(namespace, repoName, portNum);
			const deployObject  = await readDeployment(namespace, repoName);
			const deployInfo = await parseRepo(namespace, deployObject);
			res.status(200).send(JSON.stringify(deployInfo));
		} else {
			res.status(401).send('Namespace,reponame and portNum should be checked.');
		}
	} catch (err) {
		res.status(401).send(err);
	}
}))

const updateReadDoc = (namespace: string, repoName: string, readmeDoc: string) => {
	return new Promise((resolve, reject) => {
		Repos.findOneAndUpdate({
			namespace: namespace,
			repoName: repoName
		}, {
			readmeDoc: readmeDoc
		}).then((value) => resolve(value))
		.catch((error) => reject(error));
	});
}

// readmeDoc 변경
router.patch('/:namespace/repo/:repoName/readmedoc', wrapper(async(req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization;
	const repoName = req.params.repoName;
	const readmeDoc = req.body['readmeDoc'];
	console.log("000", readmeDoc)
	try {
		if (token && repoName) {
			const namespace = verifyUser(token).data.id.toString();
			await updateReadDoc(namespace, repoName, readmeDoc);
			console.log("111", readmeDoc)
			const deployObject  = await readDeployment(namespace, repoName);
			const deployInfo = await parseRepo(namespace, deployObject);
			res.status(200).send(JSON.stringify(deployInfo));
		} else {
			res.status(401).send('Namespace,reponame and readmeDoc should be checked.');
		}
	} catch (err) {
		res.status(401).send(err);
	}
}))

module.exports = router;
