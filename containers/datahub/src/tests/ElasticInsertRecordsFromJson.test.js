import dotenv from 'dotenv';
import fs from 'fs';
import { ElasticInsertRecordsFromJson } from "../lib/endpoints/ElasticInsertRecordsFromJson.js";

// if we test locally (.env.local exists)
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}
// otherwise read from .env
else {
  dotenv.config();
}

describe('Elastic insert records from json', () => {
  beforeAll(async () => { });

  afterAll(async () => { });

  it('should test the conversion of an object array to a number array', async () => {
    let obj = new ElasticInsertRecordsFromJson();
    let input = [
      {embedding: 123, index: 1, object: 'embedding'},
      {embedding: 234, index: 1, object: 'embedding'}
    ]
    expect(obj.cleanVector(input)).toStrictEqual([123, 234]);
  })
});

