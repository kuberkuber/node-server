import { Request, Response, NextFunction, Router} from "express";
import { wrapper } from "./wrap";
import { k8sClient, k8sAppsV1Api } from "./config";

const router = Router();

const deployObject = (namespace: string, repoName: string, imageName: string, portNum: string) => {
	// metadata
	const metadata = new k8sClient.V1ObjectMeta();
	metadata.namespace = namespace;
	metadata.name = repoName;
	metadata.labels = {'app' : repoName};

	// container
	const container = new k8sClient.V1Container();
	container.name = repoName;
	container.image = imageName;
	container.imagePullPolicy = 'Always';
	const port = new k8sClient.V1ContainerPort();
	port.containerPort = Number(portNum);
	container.ports = [port];

	// template
	const template = new k8sClient.V1PodTemplateSpec();
	template.metadata = new k8sClient.V1ObjectMeta();
	template.metadata.labels = {'app': repoName};
	template.spec = new k8sClient.V1PodSpec();
	template.spec.containers = [container];

	// spec
	const spec = new k8sClient.V1DeploymentSpec();
	spec.replicas = 2;
	spec.selector = {'matchLabels': {'app': repoName}};
	spec.template = template;

	// deployment
	const deployObject = new k8sClient.V1Deployment();
	deployObject.apiVersion = 'apps/v1';
	deployObject.kind = 'Deployment';
	deployObject.metadata = metadata;
	deployObject.spec = spec;

	return new Promise((resolve) => {
		resolve(deployObject);
	});
}

router.post('/deploy', wrapper(async (req: Request, res: Response, next: NextFunction) => {
  const namespace = req.body['namespace'];
  const repoName = req.body['repoName'];
  const imageName = req.body['imageName'];
  const portNum = req.body['portNum'];
  if (namespace && repoName && imageName && portNum) {
	const deployment = await deployObject(namespace, repoName, imageName, portNum);
	// const deployRes = await k8sAppsV1Api.createNamespacedDeployment(namespace, deployment);
	res.status(200).send('hello');
  } else {
	res.status(400).send('Bad Request : namespace should be specify');
  }
}));

module.exports = router;
