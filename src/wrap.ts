import { NextFunction, Request, Response } from 'express';

export const wrapper = (asyncFunc:any) => {
  return (async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncFunc(req, res, next);
    } catch (error) {
      return next(error);
    }
  })
}
