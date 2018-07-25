import { RequestHandler } from 'express';
import { BusinessFunction } from '../../models/Business-function';

import {
  RequestError,
  RequestErrorType,
} from '../../error-handler/RequestError';

export const listBusinessFns: RequestHandler = async (req, res, next) => {
  try {
    const businessFunctions = await BusinessFunction.find({}).exec();
    return res.status(200).send({
      success: true,
      businessFunctions,
    });
  } catch (err) {
    return next(new RequestError(RequestErrorType.INTERNAL_SERVER_ERROR, err));
  }
};