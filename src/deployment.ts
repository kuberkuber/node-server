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
import { k8sAppsV1Api } from '../src/config';

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

export const deployDeployment = async(namespace : string, repoName : string, imageName : string, portNum : string)
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
