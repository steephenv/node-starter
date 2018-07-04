import { get as getConfig } from 'config';
import * as express from 'express';

// swagger
import { swaggerSpec } from './swagger';

// route imports
import { auth } from './auth';
import { utils } from './utils';
import { assets } from './assets';

// create router
export const apis = express.Router();

// define route navigation
apis.use('/auth', auth);
apis.use('/utils', utils);
apis.use('/assets', assets);

// load docs if requested
if (getConfig('app.docs')) {
  // tslint:disable-next-line:no-var-requires
  // const swaggerSpec = require('./swagger');

  // deliver swagger spec
  apis.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
