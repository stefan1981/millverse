import { Postgres } from './postgres.js';
import { fetchEmbeddingApi } from './FetchEmbeddingApi.js';
import { VectorCaching } from './VectorCaching.js';

/*
*        ...
*        initDb                            // initialize the database
*        createTableWzCodesKeywordsGrouped // create a new table with grouped keywords
*        getVectorToPostgres               // get vector from embedding and turns it into a postgres vector
*        columnVectorize                   // vectorize a column (inside annotation table)
*        searchAll                         // search for a text in all tables
*        searchSpecificTable            // search in the annotations-table where the vectorized data lives
*        ...
*/


export class Vectorizing {
  constructor() {
    this.postgres = new Postgres();
  }


  // ************************************************************************************************
  async copyDataToVectorTable(srcTable, srcTextColumn, srcIdColumn) {

    if (!await this.postgres.tableExists('vector-table')) {
      this.createVectorTable();
    }

    if (!await this.postgres.tableExists('vector-table-cache')) {
      this.createVectorTableCache();     
    }

    const text = `"${srcTextColumn}"`;
    const key = `"${srcIdColumn}"`;
    
    const query = `
      INSERT INTO "vector-table"
      (source_table, source_text_column, source_key_column, key, text, hashed_text)
      SELECT $1, $2, $3, ${key}, ${text}, md5(${text}::text) FROM ${srcTable};
    `;

    try {
      await this.postgres.executeQuery(query, [srcTable, text, key]);
      return {
        "status": "OK",
        "message": `Copied data from ${srcTable}.${text} to vector-table`
      };
    } catch (err) {
      console.error(`Error copying data from ${srcTable}.${text} to annotations:`, err);
      return false;
    }
  }
  
  // ************************************************************************************************
  async statisticsVectorTable() {
    try {
      const sql = `
          SELECT
            source_table, 
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "vector-table"), 2) as percentage,
            COUNT(*) as cnt
          FROM "vector-table"
          GROUP BY source_table
          ORDER BY cnt DESC;
      `;

      const result = await this.postgres.selectData(sql);
      return {
        "results": result.rows
      };
    } catch (err) {
      console.error(`Error:`, err);
      return false;
    }
  }
  
  // ************************************************************************************************
  async createVectorTable() {    
    await this.postgres.tableCreate('vector-table',
      'id SERIAL PRIMARY KEY, '
      + 'source_table VARCHAR(255), '
      + 'source_text_column VARCHAR(255), '
      + 'source_key_column VARCHAR(255), '
      + 'key VARCHAR(255), '
      + 'text TEXT, '
      + 'hashed_text VARCHAR(255), embedding VECTOR(1024)');
  }

  // ************************************************************************************************
  async createVectorTableCache() {
    await this.postgres.tableDrop('vector-table-cache');
    const schema = 'id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, '
      + 'hashed_text character varying(255), '
      + 'embedding public.vector(1024)';
    await this.postgres.tableCreate('vector-table-cache', schema);
  }

  // ************************************************************************************************
  async columnVectorize() {
    const query = `SELECT text, hashed_text FROM "vector-table" WHERE embedding IS NULL`;
    const vectorCache = new VectorCaching();

    try {
      const result = await this.postgres.query(query);
      let i = 0;
      for (const row of result.rows) {
        i = i + 1;
        
        const hashed_txt = row['hashed_text'];

        const cachedVector = await vectorCache.cacheVectorRetrieve(hashed_txt);
        let vectorString = null;
        if (cachedVector != null) {
          vectorString = cachedVector;
          console.log(`${i} ${hashed_txt} load from cache`);
        } else {
          console.log(`${hashed_txt} cache it`);
          
          const embedding = await fetchEmbeddingApi(row['text']);
          const vector = embedding;
          vectorString = `[${vector.join(",")}]`;
          await vectorCache.cacheVectorStore(hashed_txt, vectorString);
        }

        // // SQL query to update the embedding column
        const updateQuery = `UPDATE "vector-table" SET embedding = $1 WHERE hashed_text = $2`;

        try {
          await this.postgres.query(updateQuery, [vectorString, hashed_txt]);
        } catch (err) {
          console.error(`Error inserting vector into table vector-table`, err);
        }
      }
      console.log("columnVectorize done");

      return true;
    } catch (err) {
      console.error(`Error: `, err);
      return false;
    }
  }


  // ************************************************************************************************
  async getVectorToPostgres(text) {
    const embedding = await fetchEmbeddingApi(text);
    const vector = embedding['data'][0]['embedding'];
    const vectorString = `[${vector.join(",")}]`;
    return vectorString;
  }


  // ************************************************************************************************
  async searchSpecificTable(tableName, text, limit = 5) {
    try {
      //const searchVector = await this.getVectorToPostgres(text);
      const embedding = await fetchEmbeddingApi(text);
      const searchVector = `[${embedding.join(",")}]`;

      //const searchVector = text;
      let result = null;
      if (tableName == "" || tableName == undefined) {
        console.log("searching in all tables");
        const query = `
          SELECT text, key, ROUND((embedding <=> $1)::numeric, 2) AS score, source_table
          FROM "vector-table"
          ORDER BY score LIMIT ${limit};`
        result = await this.postgres.query(query, [searchVector]);
      } else {
        const query = `
          SELECT text, key, ROUND((embedding <=> $1)::numeric, 2) AS score, source_table
          FROM "vector-table"
          WHERE source_table = $2 ORDER BY score LIMIT ${limit};`
        result = await this.postgres.query(query, [searchVector, tableName]);
      }

      return {
        "result": result.rows
      };
    } catch (err) {
      console.error(`Error:`, err);
      return false;
    }
  }
  // ************************************************************************************************

}
