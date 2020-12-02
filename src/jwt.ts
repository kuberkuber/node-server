import { jwtSecretKey } from '../src/config';
const jwt = require('jsonwebtoken');

export const issueJwt = (user: {name: string, id: string, accessToken: string}) => {
	const token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
		data: {
			id: user.id,
			token: user.accessToken
		}
	}, jwtSecretKey);
	return token;
}

export const verifyUser = (accessToken: string) => {
	const token = accessToken.split(' ')[1];
	if (token === undefined)
	  throw new Error("Invalid JWT");
	const user = jwt.verify(token, jwtSecretKey);
	return user;
}
