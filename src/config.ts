import * as k8sClient from '@kubernetes/client-node';

const kc = new k8sClient.KubeConfig();
kc.loadFromDefault();
export const k8sCoreV1Api = kc.makeApiClient(k8sClient.CoreV1Api);
export const k8sAppsV1Api = kc.makeApiClient(k8sClient.AppsV1Api);
export const k8sNetworkV1beta1Api = kc.makeApiClient(k8sClient.NetworkingV1beta1Api);
export const NLB_URL = "kuberkuber-cluster-bace65abd86cb82e.elb.ap-northeast-2.amazonaws.com";
