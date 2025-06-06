import { ElasticConnector } from './ElasticConnector.js';

export class ElasticDeleteIndex extends ElasticConnector {
  constructor() {
    super()
  }

  async delete(indexName) {
    const j = {
      "index": indexName
    }
    
    try {
      return await this.getClient().indices.delete(j)
    } catch (error) {
      console.error("Error fetching data:", error);
      return { "Error": error }
    }  
  }
}