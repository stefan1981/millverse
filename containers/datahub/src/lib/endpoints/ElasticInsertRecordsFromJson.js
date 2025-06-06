import { readFile, readdir, stat } from 'fs/promises';

import { ElasticConnector } from './ElasticConnector.js';
import { createVectorFromString } from '../Vectorizer.js';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class ElasticInsertRecordsFromJson extends ElasticConnector {
  constructor() {
    super()
  }

  async readJsonFile(filePath) {
    try {
        const jsonString = await readFile(filePath, 'utf8'); // Asynchronous file read
        const data = JSON.parse(jsonString); // Parse the JSON content
        return data; // Return the parsed data
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('File not found:', filePath);
        } else {
            console.error('Error reading file:', error.message);
        }
        return null; // Return null in case of an error
    }
  }
  
  cleanVector(vec) {
    return vec.map((r)=>{ return r.embedding})
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
          },
          "name": {
            "type": "text"
          },          
          "link": {
            "type": "text"
          },          
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

  async insert(fileName) {
    const indexName = fileName.replace('.json', '')

    console.log(`FileName: ${fileName} IndexName: ${indexName}`);
    try {
      await this.getClient().indices.delete({ "index": indexName });
    } catch (error) {
      console.error("Error: Index does not exist");
    }
    try {
      await this.create(indexName);
    } catch (error) {
      console.error("Error: Index can not be created");
    }

    const inputJson = await this.readJsonFile( './src/data/' + fileName);

    (async () => {
      for (let data of inputJson.data) {
        // enzure that keywords is never empty
        if (data['keywords'] == '') {
          data['keywords'] = data['text']
        }

        let link = ""
        if ('link' in data) {
          link = data['link']
        }

        let name = ""
        if ('name' in data) {
          name = data['name']
        }

        const vector_array = data['keywords'].split(', ');

        const keywords_vector = this.cleanVector(await createVectorFromString(data['keywords']))
        const text_vector = this.cleanVector(await createVectorFromString(data['text']))
        const j = {
          index: indexName,
          id: uuidv4(),
          document: {
            "id": data['id'],
            "keywords": vector_array,
            "keywords_vector": keywords_vector,
            "text": data['text'],
            "text_vector": text_vector,
            "name": name,
            "link": link
          }
        }
        try {
          await this.getClient().index(j)
        } catch (error) {
          console.error("Error fetching data:", error);
          return { "Error": error }
        }  
      }
    })();
   
    
    return { "Success": "Records have been inserted successfully" }
    
  }
}
