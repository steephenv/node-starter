/* tslint:disable:variable-name */

import { model as mongooseModel, Schema } from 'mongoose';

const ResetPasswordSchema: Schema = new Schema({
  email: {
    type: String,
    require: true,
  },
  token: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});
export const ResetPassword = mongooseModel(
  'ResetPassword',
  ResetPasswordSchema,
);