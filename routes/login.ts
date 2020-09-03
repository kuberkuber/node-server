import { Router, NextFunction, Request, Response } from 'express';
import { wrapper } from '../src/wrap';
import { codeUrl, tokenUrl, clientId, clientSecret } from '../src/config';

const axios = require('axios');
const router = Router();

router.get('/login', wrapper(async (req: Request, res: Response) => {
	if (req.query['code'] == undefined)
		res.redirect(codeUrl+'?client_id='+clientId+'&redirect_uri=http://localhost:5000/login');
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
			res.redirect('http://localhost:5000/?namespace=test&token='+tokenRes.data);
		})
	}
}));

module.exports = router;
