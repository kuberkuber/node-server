import http = require('http');
import {
	V1ObjectMeta,
	V1Deployment,
	V1Container,
	V1ContainerPort,
	V1PodTemplateSpec,
	V1PodSpec,
	V1DeploymentSpec,
} from '@kubernetes/client-node';
import { k8sAppsV1Api } from './config';
import { getTimeISOFormat, sleep } from './utils';

const deployObject = async(namespace: string, repoName: string, imageName: string, portNum: string)
: Promise<V1Deployment> =>
{
	const metadata = new V1ObjectMeta;
	metadata.namespace = namespace;
	metadata.name = repoName;
	metadata.labels = {'app' : repoName};

	const container = new V1Container;
	container.name = repoName;
	container.image = imageName;
	container.imagePullPolicy = 'Always';
	const port = new V1ContainerPort;
	port.containerPort = Number(portNum);
	container.ports = [port];

	const template = new V1PodTemplateSpec;
	template.metadata = new V1ObjectMeta;
	template.metadata.labels = {'app': repoName};
	template.spec = new V1PodSpec;
	template.spec.containers = [container];

	const spec = new V1DeploymentSpec;
	spec.replicas = 2;
	spec.selector = {'matchLabels': {'app': repoName}};
	spec.template = template;

	const deployObject = new V1Deployment;
	deployObject.apiVersion = 'apps/v1';
	deployObject.kind = 'Deployment';
	deployObject.metadata = metadata;
	deployObject.spec = spec;

	return new Promise((resolve) => {
		resolve(deployObject);
	});
}

export const deployDeployment = async(namespace: string, repoName: string, imageName: string, portNum: string)
: Promise<{
	response: http.IncomingMessage;
	body: V1Deployment;
}> => {
	const deployment = await deployObject(namespace, repoName, imageName, portNum);
	const deployRes = await k8sAppsV1Api.createNamespacedDeployment(namespace, deployment);
	return new Promise((resolve) => {
		resolve(deployRes);
	})
}


export const readDeployment = async(namespace: string, repoName: string) : Promise<V1Deployment>=> {
	const startTime = new Date();
	try {
		while (true) {
			const ret = await k8sAppsV1Api.readNamespacedDeployment(repoName, namespace);
			if (ret.body.status?.availableReplicas && ret.body.status?.availableReplicas >= 1)
				return new Promise(resolve => resolve(ret.body));
			sleep(1000);
			if (startTime.getTime() - new Date().getTime() > 10000)
				throw new Error();
		}
	} catch (error) {
		return new Promise(reject => reject(error));
	}
}

// TODO: Time format최적화
export const redeployDeployment = async(namespace: string, repoName: string) => {
	readDeployment(namespace, repoName).then(async(deployment) => {
		const redeployTime = getTimeISOFormat().split('.')[0]+"+09:00";
		if (!deployment.spec || !deployment.spec.template.metadata)
			throw new Error();
		deployment.spec.template.metadata.annotations = {
			"kubectl.kubernetes.io/restartedAt" : redeployTime,
		}
		await k8sAppsV1Api.replaceNamespacedDeployment(repoName, namespace, deployment).then((value) => {
			return Promise.resolve(value);
		})
		return Promise.resolve();
	}).catch((error) => {
		return Promise.reject(error);
	})
}

export const updateDeployment = async(namespace: string, repoName: string, portNum?: string) => {
	readDeployment(namespace, repoName).then(async(deployment) => {
		if (!deployment.spec || !deployment.spec.template.spec)
			throw new Error();
		const container = deployment.spec.template.spec.containers[0];
		if (!container.ports)
			throw new Error();
		if (portNum && container.ports[0].containerPort != Number(portNum)) {
			container.ports = [{
				"containerPort": Number(portNum),
			}];
		}
		await k8sAppsV1Api.replaceNamespacedDeployment(repoName, namespace, deployment).then((value) => {
			return Promise.resolve(value);
		});
	}).catch((error) => {
		return Promise.reject(error);
	});
}

export const deleteDeployment = async(namespace: string, repoName: string) => {
	try {
		await k8sAppsV1Api.deleteNamespacedDeployment(repoName, namespace).then((value) => {
			return Promise.resolve(value);
		});
	} catch (error) {
		return Promise.reject(error);
	}
}
