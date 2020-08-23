import {
	V1Service,
	V1ObjectMeta,
	V1ServiceSpec,
	V1ServiceStatus
} from '@kubernetes/client-node';
import http = require('http');

const serviceObject = async() : Promise<V1Service> => {
	const serviceObject = new V1Service;
	// serviceObject.apiVersion =
}

export const deployService = async(namespace : string, repoName : string, imageName : string, portNum : string)
: Promise<{
	response: http.IncomingMessage;
	body: V1Service;
}> => {
	const service = await serviceObject();
	const deployRes = await k8sAppsV1Api.createNamespacedDeployment(namespace, service);
	return new Promise((resolve) => {
		resolve(deployRes);
	})
}
