import { ElasticConnector } from './ElasticConnector.js';

export class ElasticShowRecordsCount extends ElasticConnector {
  constructor() {
    super()
  }

  async get(indexName) {
    const j = {
      "index": indexName
    }
    
    try {
      const data = await this.getClient().search(j);
      return data['hits']['total']['value'];
    } catch (error) {
      console.error("Error fetching data:", error);
      return { "Error": error }
    }  
  }
}
