import { k8sNetworkV1beta1Api, NLB_URL } from './config';
import {
	NetworkingV1beta1Ingress,
	V1ObjectMeta,
	NetworkingV1beta1IngressSpec,
	NetworkingV1beta1IngressRule,
	NetworkingV1beta1HTTPIngressRuleValue,
	NetworkingV1beta1HTTPIngressPath,
	NetworkingV1beta1IngressBackend,
} from '@kubernetes/client-node';
import http = require('http');

const ingressObject = async(namespace: string, repoName: string, portNum: string)
: Promise<NetworkingV1beta1Ingress> =>
{
	const ingressPath = new NetworkingV1beta1HTTPIngressPath();
	ingressPath.path = "/" + namespace + "/" + repoName + "(/|$)(.*)";
	ingressPath.backend = new NetworkingV1beta1IngressBackend();
	ingressPath.backend.serviceName = repoName;
	ingressPath.backend.servicePort = new Number(portNum);

	const rule = new NetworkingV1beta1IngressRule;
	rule.host = NLB_URL;
	rule.http = new NetworkingV1beta1HTTPIngressRuleValue();
	rule.http.paths = [ingressPath];

	const spec = new NetworkingV1beta1IngressSpec;
	spec.rules = [rule]

	const metadata = new V1ObjectMeta;
	metadata.name = repoName;
	metadata.annotations = {
		"kubernetes.io/ingress.class": "nginx",
		"nginx.ingress.kubernetes.io/enable-cors": "true",
		"nginx.ingress.kubernetes.io/cors-allow-origin": "*",
		"nginx.ingress.kubernetes.io/rewrite-target": "/$2"
	}

	const ingress = new NetworkingV1beta1Ingress();
	ingress.apiVersion = "networking.k8s.io/v1beta1";
	ingress.kind = "Ingress";
	ingress.metadata = metadata;
	ingress.spec = spec;

	return new Promise((resolve) => {
		resolve(ingress);
	})
}

export const deployIngress = async(namespace: string, repoName: string, portNum: string)
: Promise<{
	response: http.IncomingMessage;
	body: NetworkingV1beta1Ingress;
}> => {
	const ingress = await ingressObject(namespace, repoName, portNum);
	const deployRes = await k8sNetworkV1beta1Api.createNamespacedIngress(namespace, ingress);
	return new Promise((resolve) => {
		resolve(deployRes);
	})
}

const readIngress = async(namespace: string, repoName: string) => {
	try {
		const ret = await k8sNetworkV1beta1Api.readNamespacedIngress(repoName, namespace);
		return new Promise((resolve) => resolve(ret));
	} catch (error) {
		return new Promise((reject) => reject(error));
	}
}

export const deleteIngress = async(namespace: string, repoName: string) => {
	try {
		await k8sNetworkV1beta1Api.deleteNamespacedIngress(repoName, namespace).then((value) => {
			return new Promise(resolve => resolve(value));
		});
	} catch (error) {
		return new Promise(reject => reject('Already deleted'));
	}
}
