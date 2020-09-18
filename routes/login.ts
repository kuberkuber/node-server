import { Router, NextFunction, Request, Response } from 'express';
import { wrapper } from '../src/wrap';
import { codeUrl, tokenUrl, clientId, clientSecret } from '../src/config';
import axios from 'axios';
// const axios = require('axios');
const router = Router();

router.get('/login', wrapper(async (req: Request, res: Response) => {
	if (req.query['code'] == undefined)
	{
		res.send(codeUrl+'?client_id='+clientId+'&redirect_uri=http://363750994707.ngrok.io/login');
		// res.send(codeUrl+'?client_id='+clientId+'&redirect_uri=http://ec2-15-165-100-105.ap-northeast-2.compute.amazonaws.com:5000/login');
	}
	else
	{
		const code = req.query['code'];
		const options = {
			client_id: clientId,
			client_secret: clientSecret,
			code: code,
		}
		axios.post(tokenUrl, options)
		.then((tokenRes: any) => {
			res.redirect('http://363750994707.ngrok.io/user?'+tokenRes.data);
			// res.redirect('http://ec2-15-165-100-105.ap-northeast-2.compute.amazonaws.com:5000/user?'+tokenRes.data);
		})
	}
}));

module.exports = router;
