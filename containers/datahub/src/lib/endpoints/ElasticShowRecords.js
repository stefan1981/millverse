import { ElasticConnector } from './ElasticConnector.js';

export class ElasticShowRecords extends ElasticConnector {
  constructor() {
    super()
  }

  async get(indexName) {
    const j = {
      "index": indexName
    }
    
    try {
      const data = await this.getClient().search(j);
      return data['hits'];
    } catch (error) {
      console.error("Error fetching data:", error);
      return { "Error": error }
    }  
  }
}
