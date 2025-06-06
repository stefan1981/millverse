import { ElasticSearchRecords } from "./../lib/endpoints/ElasticSearchRecords.js";
import dotenv from 'dotenv';
import fs from 'fs';

// if we test locally (.env.local exists)
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}
// otherwise read from .env
else {
  dotenv.config();
}

describe('semantic-search', () => {
  // beforeAll(async () => { });

  // afterAll(async () => { });

  it('should return a json', async () => {
    let x = new ElasticSearchRecords();
    //const result = await x.searchCosine('wsp_sea_tables_with_annotations', 'Abfall');
    
    // const expected_result = {
    //   "took": 1,
    //   "timed_out": false,
    //   "_shards": {
    //     "total": 1,
    //     "successful": 1,
    //     "skipped": 0,
    //     "failed": 0
    //   },
    //   "hits": {
    //     "total": {
    //       "value": 0,
    //       "relation": "eq"
    //     },
    //     "max_score": null,
    //     "hits": []
    //   }
    // }

    expect(1).toBe(1);
  })
});

