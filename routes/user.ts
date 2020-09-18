import { Router, NextFunction, Request, Response } from 'express';
import { wrapper } from '../src/wrap';
import { Users } from '../schemas/user';
import { k8sCoreV1Api, jwtSecretKey } from '../src/config';
import axios from 'axios';
import { V1Namespace, V1ObjectMeta } from '@kubernetes/client-node';
import jwt from 'jsonwebtoken';

const router = Router();

const isNewUser = (user: {name: string, id: string, accessToken: string}) : Promise<any>=> {
	return new Promise((resolve, reject) => {
		Users.findOne({
		name: user.name,
		id : user.id,
	  }).exec().then((value) => {
		if (value === null)
			resolve(true);
		else
			resolve(false);
	  }).catch((error) => {
		reject(error)
	  });
	})
}

const insertUser = (user: {name: string, id: string, accessToken: string}) : Promise<any>=> {
	return new Promise((resolve, reject) => {
		Users.create({
		name: user.name,
		id: user.id,
		accessToken: user.accessToken,
	  }).then((value) => {
		resolve(value)
	  }).catch((error) => {
		reject(error)
	  });
	})
}

const deployNamespace = async(id: string)
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

const issueJwt = (user: {name: string, id: string, accessToken: string}) => {
	const token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + (60 * 60),
		data: {
			id: user.id,
			token: user.accessToken
		}
	}, 'jwtSecretKey', {algorithm: 'RS256'});
	return token;
}

router.get('/user', wrapper(async (req: Request, res: Response) => {
	const accessToken = req.query['access_token']?.toString();
	if (accessToken) {
		axios.get('https://api.github.com/user', {headers: {
			'Authorization': 'token ' + accessToken
		}})
		.then(async(userRes: any) => {
			const user = {
				name: userRes.data.login,
				id: userRes.data.id,
				accessToken: accessToken
			};
			if (await isNewUser(user)) {
				await insertUser(user);
				await deployNamespace(user.id);
			}
			// jwt발급
			const jwt = issueJwt(user);
			console.log(jwt);
			res.header("jwt", "hello");
			// res.cookie("jwt", "hi");
			res.header("Access-Control-Allow-Origin", "http://localhost:3000");
			res.redirect('http://localhost:3000/join?namespace='+user.name);
		})
	} else {
		res.send(404);
	}
}));

module.exports = router;
