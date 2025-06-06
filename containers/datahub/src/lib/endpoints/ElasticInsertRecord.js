import { ElasticConnector } from './ElasticConnector.js';
import { createVectorFromString } from '../Vectorizer.js';
import { v4 as uuidv4 } from 'uuid';

export class ElasticInsertRecord extends ElasticConnector {
  constructor() {
    super()
  }

  async insert(indexName) {

  
    const vec = await createVectorFromString("this is an example")
    const vector = vec.map((r)=>{ return r.embedding})
    const j = {
      index: indexName,
      id: uuidv4(),
      document: {
        "id": "our own id",
        "keywords": "bla, foo, baz",
        "text": "this is an example",
        "text_vector": vector
      }
    }
    
    try {
      return await this.getClient().index(j)
    } catch (error) {
      console.error("Error fetching data:", error);
      return { "Error": error }
    }  
  }
}
