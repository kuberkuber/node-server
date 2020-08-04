import * as k8sClient from '@kubernetes/client-node';

const kc = new k8sClient.KubeConfig();
kc.loadFromDefault();
export const k8sCoreV1Api = kc.makeApiClient(k8sClient.CoreV1Api);
export const k8sAppsV1Api = kc.makeApiClient(k8sClient.AppsV1Api);
