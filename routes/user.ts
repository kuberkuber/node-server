import { Router, NextFunction, Request, Response } from 'express';
import { wrapper } from '../src/wrap';

const axios = require('axios');
const router = Router();

router.get('/user', wrapper(async (req: Request, res: Response) => {
	const jwt = req.query['access_token']
	console.log(jwt)
	if (jwt) {
		axios.get('https://api.github.com/user', {headers: {
			'Authorization': 'token ' + jwt
		}})
		.then((userRes: any) => {
			const namespace = userRes.data.login;
			res.header("Access-Control-Allow-Origin", "http://localhost:3000");
			res.redirect('http://localhost:3000/?namespace='+namespace);
		})
	} else {
		res.send(404);
	}
}));

module.exports = router;
