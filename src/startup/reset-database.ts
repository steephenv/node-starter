/* tslint:disable:no-console */
import { Promise as BluePromise } from 'bluebird';
import * as mongoose from 'mongoose';
import { mongooseConnectionPromise } from '../db.init';

import { initUsers } from './users';
import { createMVP } from './add-mvp';
import { createSlot } from './set-slots';

const resetDatabase = async () => {
  await mongooseConnectionPromise;
  console.log('connected to db');
  try {
    await BluePromise.all([
      mongoose.connection.db.dropCollection('users').catch(errHandler),
      mongoose.connection.db.dropCollection('tempusers').catch(errHandler),
    ]);
    await BluePromise.all([initUsers()]);
    await createSlot();
    await createMVP();
  } catch (err) {
    console.log(err);
  }
  await mongoose.disconnect();
  return;
};

export = resetDatabase;

function errHandler(err: any) {
  if (err.code !== 26) {
    console.log(err);
    return;
  }
  throw err;
}
