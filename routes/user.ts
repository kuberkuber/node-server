import { Router, NextFunction, Request, Response } from 'express';
import { wrapper } from '../src/wrap';
import { Users } from '../schemas/user';
import { issueJwt } from '../src/jwt';
import { deployNamespace } from '../src/namespace';
import axios from 'axios';

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

/*
 user module
 get user info from access token
 if new user, insert user to db and make namespace at cluster
 return: new jwt
 */
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
			const jwt = issueJwt(user);
			res.status(200).send({'jwt': jwt, name: user.name});
		})
	} else {
		res.send(404);
	}
}));

module.exports = router;
