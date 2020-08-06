import { Request, Response, NextFunction, Router} from 'express';
import { wrapper } from '../src/wrap';
import { k8sAppsV1Api } from '../src/config';
import {
	V1ObjectMeta,
	V1Deployment,
	V1Container,
	V1ContainerPort,
	V1PodTemplateSpec,
	V1PodSpec,
	V1DeploymentSpec,
} from '@kubernetes/client-node';
import repoTable from '../schemas/repo';

const router = Router();

const deployObject = async(namespace: string, repoName: string, imageName: string, portNum: string) : Promise<V1Deployment> => {
	// metadata
	const metadata = new V1ObjectMeta;
	metadata.namespace = namespace;
	metadata.name = repoName;
	metadata.labels = {'app' : repoName};

	// container
	const container = new V1Container;
	container.name = repoName;
	container.image = imageName;
	container.imagePullPolicy = 'Always';
	const port = new V1ContainerPort;
	port.containerPort = Number(portNum);
	container.ports = [port];

	// template
	const template = new V1PodTemplateSpec;
	template.metadata = new V1ObjectMeta;
	template.metadata.labels = {'app': repoName};
	template.spec = new V1PodSpec;
	template.spec.containers = [container];

	// spec
	const spec = new V1DeploymentSpec;
	spec.replicas = 2;
	spec.selector = {'matchLabels': {'app': repoName}};
	spec.template = template;

	// deployment
	const deployObject = new V1Deployment;
	deployObject.apiVersion = 'apps/v1';
	deployObject.kind = 'Deployment';
	deployObject.metadata = metadata;
	deployObject.spec = spec;

	return new Promise((resolve) => {
		resolve(deployObject);
	});
}

// TODO : endpointFile 추가
const insertRepoTable = async(deployRepo: V1Deployment) => {
	repoTable.create({
		namespace : deployRepo.metadata?.namespace,
		repoName : deployRepo.metadata?.name,
		imageName : deployRepo.spec?.template.spec?.containers[0].image,
		portNum : deployRepo.spec?.template.spec?.containers[0].ports![0].containerPort,
		createdAt : deployRepo.metadata?.creationTimestamp,
	}).then(() => {
		return Promise.resolve(200);
	}).catch((Error) => {
		return Promise.reject(new Error(400));
	})
}

router.post('/deploy', wrapper(async (req: Request, res: Response, next: NextFunction) => {
  const namespace = req.body['namespace'];
  const repoName = req.body['repoName'];
  const imageName = req.body['imageName'];
  const portNum = req.body['portNum'];
  if (namespace && repoName && imageName && portNum) {
	const deployment = await deployObject(namespace, repoName, imageName, portNum);
	const deployRes = await k8sAppsV1Api.createNamespacedDeployment(namespace, deployment);
	await insertRepoTable(deployRes.body);
	// console.log(await repoTable.find({}));
	res.status(200).send('deploy finished');
  } else {
	res.status(400).send('Bad Request : namespace should be specify');
  }
}));

module.exports = router;
