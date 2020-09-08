import { Router, NextFunction, Request, Response } from 'express';
import { wrapper } from '../src/wrap';
import { codeUrl, tokenUrl, clientId, clientSecret } from '../src/config';

const axios = require('axios');
const router = Router();

router.get('/login', wrapper(async (req: Request, res: Response) => {
	if (req.query['code'] == undefined)
	{
		res.send(codeUrl+'?client_id='+clientId+'&redirect_uri=http://48a3b680606e.eu.ngrok.io/login');
		// res.redirect(codeUrl+'?client_id='+clientId+'&redirect_uri=http://48a3b680606e.eu.ngrok.io/login');
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
			console.log(tokenRes.data);
			// res.redirect('http://48a3b680606e.eu.ngrok.io/?namespace=test&token='+tokenRes.data);
			res.send('http://48a3b680606e.eu.ngrok.io/?namespace=test&token='+tokenRes.data);
		})
	}
}));

module.exports = router;
