import {NextFunction, Request, Response} from "express";

const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req : Request, res : Response, next : NextFunction) {
  res.status(200).json({ title: 'Express' });
  // res.render('index', { title: 'Express' });
});

module.exports = router;
