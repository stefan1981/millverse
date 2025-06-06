import { ElasticConnector } from './ElasticConnector.js';

export class ElasticShowIndexMapping extends ElasticConnector {
  constructor() {
    super()
  }

  async show(indexName) {
    const j = {
      "index": indexName
    }
    try {
      return await this.getClient().indices.getMapping(j)
    } catch (error) {
      console.error("Error fetching data:", error);
      return { "Error": error }
    }  
  }
}