import { fetchEmbeddingApi } from './FetchEmbeddingApi.js';
import { Postgres } from './postgres.js';

/*
*        cacheVectorRetrieve          // retrieve vector from vector-table-cache table if exists
*        cacheVectorStore             // store vector in vector-table-cache table if not exists
*/

export class VectorCaching {
  constructor() {
    this.postgres = new Postgres();
  }

  // ************************************************************************************************
  async cacheVectorRetrieve(hashed_text) {
    const query = `SELECT embedding FROM "vector-table-cache" WHERE hashed_text = $1`;
    try {
      const result = await this.postgres.query(query, [hashed_text]);
      if(result.rows.length > 0) {
        return result.rows[0].embedding;
      } else {
        return null;
      }
    } catch (err) {
      console.error(`Error getting vector for hashed_text ${hashed_text}`, err);
      return null;
    }
  }
  // ************************************************************************************************
  async cacheVectorStore(hashed_text, vector) {
    const checkQuery = `SELECT 1 FROM "vector-table-cache" WHERE hashed_text = $1 LIMIT 1`;
    const insertQuery = `INSERT INTO "vector-table-cache" (hashed_text, embedding) VALUES ($1, $2)`;
  
    try {
      const result = await this.postgres.query(checkQuery, [hashed_text]);
  
      if (result.rowCount === 0) {
        await this.postgres.query(insertQuery, [hashed_text, vector]);        
      }
    } catch (err) {
      console.error(`Error caching vector for hashed_text ${hashed_text}`, err);
    }
  }

  // ************************************************************************************************
  async getVectorToPostgres (text) {
    const embedding = await fetchEmbeddingApi(text);
    const vector = embedding['data'][0]['embedding'];
    const vectorString = `[${vector.join(",")}]`;
    return vectorString;
  }
}