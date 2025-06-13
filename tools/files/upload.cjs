const prompt = require('prompt');
const dotenv = require('dotenv');
const Minio = require('minio');
const path = require('path');

dotenv.config({path: path.join(__dirname, '.env')});

const s3 = new Minio.Client({
  endPoint: process.env.ASSET_STORE_END_POINT,
  port: parseInt(process.env.ASSET_STORE_PORT),
  useSSL: process.env.ASSET_STORE_USE_SSL === 'true',
  accessKey: process.env.ASSET_STORE_ACCESS_KEY,
  secretKey: process.env.ASSET_STORE_SECRET_KEY
});

/** @type { () => Promise<{objectName: string, filePath: string | null | undefined, projectTitle: string}> } */
const getDetails = () => {
  prompt.start();
  prompt.message = 'Enter project title, the object\'s name and the file\'s path:\n';
  prompt.delimiter = '';
  return prompt.get({
    properties: {
      projectTitle: {
        message: 'project title:',
        required: true
      },
      objectName: {
        message: 'object name:',
        required: true
      },
      filePath: {
        message: 'file path:'
      }
    }
  });
};

const run = async () => {
  const { projectTitle, objectName, filePath } = await getDetails();
  s3.fPutObject(projectTitle, objectName, filePath === null || filePath === undefined ? objectName : filePath).catch(console.error);
};

run().catch(console.error);
