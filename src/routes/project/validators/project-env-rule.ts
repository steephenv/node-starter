import * as Joi from 'joi';
import { RequestHandler } from 'express';

const objectSchema = Joi.object({
  stakeHolder: Joi.string().allow(''),
  businessFunction: Joi.string().allow(''),
  businessFunctionRole: Joi.string().allow(''),
  sponsorsPosition: Joi.string().allow(''),
  managersPosition: Joi.string().allow(''),
}).required();

// tslint:disable:variable-name
const ProjectEnvSchema = Joi.object().keys({
  stakeHolders: Joi.array()
    .items(objectSchema)
    .min(1)
    .required(),
});

export const projectEnvValidation: RequestHandler = (req, res, next) => {
  Joi.validate(
    req.body,
    ProjectEnvSchema,
    { stripUnknown: true },
    (err: any) => {
      if (err) {
        return res.status(422).send({
          success: false,
          msg: err,
        });
      }
      next();
    },
  );
};
