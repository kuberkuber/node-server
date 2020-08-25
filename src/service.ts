import {
	V1Service,
	V1ObjectMeta,
	V1ServiceSpec,
	V1ServicePort,
} from '@kubernetes/client-node';
import { k8sCoreV1Api } from './config';
import http = require('http');
import { sleep } from './utils';

const serviceObject = async(namespace : string, repoName : string, portNum : string)
: Promise<V1Service> =>
{
	const metadata = new V1ObjectMeta;
	metadata.name = repoName;
	metadata.namespace = namespace;

	const spec = new V1ServiceSpec;
	spec.type = "ClusterIP";
	spec.selector = {
		"app" : repoName,
	}
	const servicePort = new V1ServicePort;
	servicePort.port = Number(portNum);
	servicePort.targetPort = new Number(portNum);
	spec.ports = [servicePort]

	const serviceObject = new V1Service;
	serviceObject.apiVersion = "v1";
	serviceObject.kind = "Service";
	serviceObject.metadata = metadata;
	serviceObject.spec = spec;

	return new Promise((resolve) => {
		resolve(serviceObject);
	})
}

// TODO: 예외처리
export const deployService = async(namespace: string, repoName: string, portNum: string)
: Promise<{
	response: http.IncomingMessage;
	body: V1Service;
}> => {
	const service = await serviceObject(namespace, repoName, portNum);
	const deployRes = await k8sCoreV1Api.createNamespacedService(namespace, service);
	return new Promise((resolve) => {
		resolve(deployRes);
	})
}

const readService = async(namespace: string, repoName: string) => {
	try {
		const ret = await k8sCoreV1Api.readNamespacedService(repoName, namespace);
		return new Promise(resolve => resolve(ret));
	} catch (error) {
		return new Promise(reject => reject(error));
	}
}

export const deleteService = async(namespace: string, repoName: string) => {
	try {
		await k8sCoreV1Api.deleteNamespacedService(repoName, namespace).then((value) => {
			return Promise.resolve(value);
		});
	} catch (error) {
		return Promise.reject(error);
	}
}
