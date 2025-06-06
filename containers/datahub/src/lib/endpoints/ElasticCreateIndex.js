import { ElasticConnector } from './ElasticConnector.js';

export class ElasticCreateIndex extends ElasticConnector {
  constructor() {
    super()
  }

  async create(indexName) {
    const j = {
      "index": indexName,
      "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 1
      },
      "mappings": {
        "properties": {
          "id": {
            "type": "keyword"
          },
          "keywords": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                //"ignore_above":256 //amount in bytes
              }
            }
          },
          "keywords_vector": {  
            "type": "dense_vector",
            "dims": 768
          },          
          "text": {
            "type": "text"
          },
          "text_vector": {  
            "type": "dense_vector",
            "dims": 768
          }
        }
      }
    }
    
    
    try {
      return await this.getClient().indices.create(j)
    } catch (error) {
      console.error("Error fetching data:", error);
      return { "Error": error }
    }  
  }
}
