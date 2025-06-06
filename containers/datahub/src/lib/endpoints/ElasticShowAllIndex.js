import { ElasticConnector } from './ElasticConnector.js';

export class ElasticShowAllIndex extends ElasticConnector {
  constructor() {
    super()
  }

  async show() {
    const j = {
      format: 'json',
      h: ['index', 'health', 'status', 'docs.count']
    }
    try {
      return await this.getClient().cat.indices(j)
    } catch (error) {
      console.error("Error fetching data:", error);
      return { "Error": error }
    }  
  }
}