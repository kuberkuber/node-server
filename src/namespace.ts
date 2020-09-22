import { V1Namespace, V1ObjectMeta } from '@kubernetes/client-node';
import { k8sCoreV1Api } from '../src/config';

export const deployNamespace = async(id: string)
: Promise<V1Namespace> => {
	return new Promise((resolve, reject) => {
		const metadata = new V1ObjectMeta;
		metadata.name = id.toString();
		const nsObject = new V1Namespace;
		nsObject.metadata = metadata;
		k8sCoreV1Api.createNamespace(nsObject)
		.then((res) => {
			resolve(res.body);
		}).catch((err) => {
			reject(err);
		})
	})
}
