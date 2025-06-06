import { ElasticConnector } from './ElasticConnector.js';
import { createVectorFromString } from '../Vectorizer.js';
import { v4 as uuidv4 } from 'uuid';

export class ElasticVectorizeText extends ElasticConnector {
  constructor() {
    super()
  }

  async vectorize(text) {
    try {
      const vec = await createVectorFromString(text)
      return {
        "text_original" : text,
        "vector_size": vec.length,
        "text_vectorized": vec.map(item => item.embedding)
      }
    } catch (error) {
      return { "error": error.message }
    }
  }
}
