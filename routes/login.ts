import { Router, NextFunction, Request, Response } from 'express';
import { wrapper } from '../src/wrap';
import { codeUrl, tokenUrl, clientId, clientSecret } from '../src/config';

const axios = require('axios');
const router = Router();

router.get('/login', wrapper(async (req: Request, res: Response) => {
	if (req.query['code'] == undefined)
	{
		// res.send(codeUrl+'?client_id='+clientId+'&redirect_uri=http://localhost:5000/login');
		res.send(codeUrl+'?client_id='+clientId+'&redirect_uri=http://8bb8d2572824.ngrok.io/login');
	}
	else
	{
		const code = req.query['code'];
		console.log(code)
		const options = {
			client_id: clientId,
			client_secret: clientSecret,
			code: code,
		}
		axios.post(tokenUrl, options)
		.then((tokenRes: any) => {
			res.redirect('http://8bb8d2572824.ngrok.io/user?'+tokenRes.data);
		})
	}
}));

module.exports = router;
