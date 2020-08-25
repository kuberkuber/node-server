export const sleep = (ms: number) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const getTimeISOFormat = () => {
	const offsetMs = new Date().getTimezoneOffset() * 60 * 1000;
	const msLocal =  new Date().getTime() - offsetMs;
	return new Date(msLocal).toISOString();
}
