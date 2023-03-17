import 'dotenv/config';
import DbClient from './db/dbClient';
import App from './app';
import { Logger } from 'tslog';

const logger: Logger = new Logger();

const port = process.env.PORT || 3000;

function appStart(app: any, port: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // Handle app listen errors
    app.on('error', error => {
      // Not a `listen` error
      if (error.syscall !== 'listen') return;

      // Specific net errors that flags the server useless
      if (error.code === 'EACCES' || error.code === 'EADDRINUSE') {
        logger.info(`App connection error ${error.code} on ${port}`);
        reject(error);
      }
    });
    app.listen(port, () => {
      resolve(app);
    });
  });
}

DbClient.connectDb()
  .then(db => {
    logger.info('Connected to MongoDB');
    return appStart(App.app, port);
  })
  .then(app => {
    logger.info(`Express server listening on port ${port}`);
  })
  .catch(err => {
    logger.error(err);
    process.exit(1);
  });
