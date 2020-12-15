import { V1Deployment, V1DeploymentList } from '@kubernetes/client-node';
import { NLB_URL } from '../src/config';
import { Repos } from '../schemas/repo';

const getRepo = (namespace: string, repoName: string) : Promise<any> => {
	return new Promise((resolve, reject) => {
	  Repos.findOne({
		namespace: namespace,
		repoName: repoName,
	  }).exec().then((value) => {
		resolve(value);
	  }).catch((error) => {
		reject(error)
	  });
	});
  }

const parsing = async(namespace: string, item : V1Deployment) : Promise<{[key: string]: string}> => {
	let itemDict: {[key: string]: string} = {};
	const metadata = item.metadata;
	const status = item.status;
	const container = item.spec?.template.spec?.containers[0]
	itemDict['image'] = container?.image!;
	itemDict['port'] = container?.ports![0].containerPort.toString() || '';
	itemDict['name'] = metadata?.name!;
	itemDict['status'] = status?.conditions![0].status || '';
	itemDict['endpoint'] = 'http://' + NLB_URL + '/' + namespace + '/' + itemDict['name'];
	// 재배포한 경우와 아닌 경우
	if (item.spec?.template.metadata?.annotations !== undefined){
	  const redeployTime = item.spec.template.metadata.annotations['kubectl.kubernetes.io/restartedAt'];
	  itemDict['deployTime'] = redeployTime;
	} else if (metadata?.creationTimestamp !== undefined) {
	  itemDict['deployTime'] = metadata.creationTimestamp.toString();
	}
	await getRepo(namespace, itemDict['name']).then((value) => {
	  if (value && value.get('license') !== undefined)
		itemDict['license'] = value.get('license');
	  if (value && value.get('apiDoc') !== undefined)
		itemDict['apiDoc'] = value.get('apiDoc');
	  if (value && value.get('readmeDoc') !== undefined)
		itemDict['readmeDoc'] = value.get('readmeDoc');
	});
	return new Promise((resolve) => {
		resolve(itemDict);
	})
}

export const parseRepos = async(namespace: string, kuberRes : V1DeploymentList) => {
	let deploys: Array<{}> = [];

	for (const item of kuberRes['items']) {
		const itemDict = await parsing(namespace, item)
		deploys.push(itemDict);
	}
	return new Promise((resolve) => {
	  resolve(deploys);
	});
  }

export const parseRepo = async(namespace: string, kuberRes : V1Deployment) => {
	const itemDict = await parsing(namespace, kuberRes);
	return new Promise((resolve) => {
		resolve(itemDict);
	})
  }
