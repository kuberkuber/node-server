import { Router, NextFunction, Request, Response } from 'express';
import { V1Pod, Log, V1PodList } from '@kubernetes/client-node';
import { wrapper } from '../src/wrap';
import { NLB_URL, kc, k8sLogsApi, k8sCoreV1Api} from '../src/config';
import { verifyUser } from '../src/jwt';
import { Repos } from '../schemas/repo';

const router = Router();

const getLogFromPod = async(namespace: string, repoName: string, podObject: V1Pod[])
: Promise<String> => {
	let podName : string = "";
	let podLog : string = "";
	const podExist = podObject.some((podItem) => {
		const tmpPodName = podItem.metadata?.name;
		if (tmpPodName && tmpPodName.startsWith(repoName)) {
			podName = tmpPodName;
			return true;
		} else {
			return false;
		}
	});
	if (podExist) {
		const log = await k8sCoreV1Api.readNamespacedPodLog(podName, namespace);
		podLog = log.body;
	}
	return new Promise((resolve,reject) => {
		if (podExist)
			resolve(podLog);
		else
			reject("Pod not Exists");
	})
}

router.get('/:namespace/repo/:repoName/log', wrapper(async (req: Request, res: Response) => {
	const token = req.headers.authorization;
	const repoName = req.params.repoName;
	try {
		if (token && repoName) {
			const namespace = verifyUser(token).data.id.toString();
			const pods = await k8sCoreV1Api.listNamespacedPod(namespace);
			const podLog = await getLogFromPod(namespace, repoName, pods.body.items);
			res.send(podLog);
		} else {
			res.status(401).send('Namespace,reponame should be checked.');
		}
	} catch (err) {
		res.status(401).send(err);
	}
}));

module.exports = router;
