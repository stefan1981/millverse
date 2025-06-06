import { ElasticConnector } from './ElasticConnector.js';
import { createVectorFromString } from '../Vectorizer.js';
import fs from 'fs';

export class ElasticSearchRecords extends ElasticConnector {
  constructor() {
    super()
  }

  getSources() {
    return {
      "excludes": [
          "keywords_vector",
          "text_vector"
      ]
    }
  }

  // cosine (on text + keywords)
  searchQueryCosine(indexName, query, vector) {
    return {
      index: indexName,
      "_source": this.getSources(),
      "size": 10,
      "query": {
        "script_score": {
          "query": {
            "match_all": {}
          },
          "script": {
            "source": "double score = (cosineSimilarity(params.queryVector, 'text_vector') + 1) / 2 + (cosineSimilarity(params.queryVector, 'keywords_vector') + 1) / 2; return score;",            
            "params": {
              "queryVector": vector
            }
          }
        }
      }
    }
  }

  // fuzzy (levenshtein) + knn
  searchQueryKnn(indexName, query, vector) {
    return {
      index: indexName,
      "_source": this.getSources(),
      "size": 10,
      "query": {
        "function_score": {
          "query": {
            "bool": {
              "should": [
                {
                  "terms": {
                    "keywords.keyword": [query],
                    "boost": 50
                  }
                },
                {
                  "knn": {
                    "field": "text_vector",
                    "query_vector": vector,
                    "k": 10,
                    "num_candidates": 100
                  },
                },
                {
                  "knn": {
                    "field": "keywords_vector",
                    "query_vector": vector,
                    "k": 10,
                    "num_candidates": 100
                  },
                }
              ]
            }
          },
          "boost_mode": "sum"  // Combines both of the scores
        }
      }
    }
  }

  // fuzzy (levenshtein)
  searchQueryFuzzy(indexName, query) {
    return {
      index: indexName,
      "_source": this.getSources(),
      "size": 10,
      "query": {
        "multi_match": {
            "query": query,
            "fields": ["text^1", "keywords^1"], // List of fields to search. Add boosts like `text^2` if needed
            "fuzziness": "AUTO"
        }
      }
    }
  }    
  

  // BM25
  searchQueryBM25(indexName, query) {
    return {
      index: indexName,
      "_source": this.getSources(),
      "size": 10,
      "query": {
        "multi_match": {
          "query": query, // The string to search for
          "fields": ["text^1", "keywords^1"], // List of fields to search. Add boosts like `text^2` if needed
          "type": "best_fields" // Default for BM25; can also use "most_fields", "cross_fields", etc.
        }
      }
    }
  }

  searchQueryRankFusion(indexName, query, vector) {
    return {
      index: indexName,
      "_source": this.getSources(),
      "size": 10,
      "retriever": {
        "rrf": {
            "retrievers": [
              {
                "standard": {
                  "query": {
                    "terms": {
                      "keywords.keyword": [query],
                      "boost": 50                  
                    }
                  }
                }
              },
              {
                "standard": {
                  "query": {
                    "multi_match": {
                        "query": query,
                        "fields": ["text^1", "keywords^1"], // List of fields to search. Add boosts like `text^2` if needed
                        "fuzziness": "AUTO"
                    }
                  }
                }
              },
              {
                "standard": {
                  "query": {
                    "multi_match": {
                      "query": query, // The string to search for
                      "fields": ["text^1", "keywords^1"], // List of fields to search. Add boosts like `text^2` if needed
                      "type": "best_fields" // Default for BM25; can also use "most_fields", "cross_fields", etc.
                    }
                  }
                }
              },
              {
                "standard": {
                  "query": {
                    "script_score": {
                      "query": {
                        "match_all": {}
                      },
                      "script": {
                        "source": "double score = (cosineSimilarity(params.queryVector, 'text_vector') + 1) / 2 + (cosineSimilarity(params.queryVector, 'keywords_vector') + 1) / 2; return score;",            
                        "params": {
                          "queryVector": vector
                        }
                      }
                    }
                  }
                }
              },
              // {
              //   "knn": {
              //     "field": "text_vector",
              //     "query_vector": vector,
              //     "k": 50,
              //     "num_candidates": 500
              //   },
              // },
              // {
              //   "knn": {
              //     "field": "keywords_vector",
              //     "query_vector": vector,
              //     "k": 50,
              //     "num_candidates": 500
              //   },
              // }
            ],
            "rank_window_size": 50,
            "rank_constant": 10
        }
    },
    }
  }
  
  getResultByLeikaCode(filePath, leikaCode) {
    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        try {
            // Parse the JSON data
            const jsonData = JSON.parse(data);

            // Find the object with the specified leika_code
            const result = jsonData.data.find(item => item.leika_code === leikaCode);

            // Check if the result was found and log it
            if (result) {
                console.log('Result found:', result);
            } else {
                console.log('No result found for the given leika_code.');
            }
        } catch (parseError) {
            console.error('Error parsing the JSON:', parseError);
        }
    });
  }

  async searchKnn(indexName, query = '') {    
    const searchQuery = query
    const vec = await createVectorFromString(searchQuery)
    const vector = vec.map((r)=>{ return r.embedding})
    
    try {
      const result = await this.getClient().search(this.searchQueryKnn(indexName, query, vector))
      return result
    } catch (error) {
      console.error("Error fetching data:", error);
      return { "Error": error }
    }  
  }


  async searchCosine(indexName, query = '') {    
    const searchQuery = query
    const vec = await createVectorFromString(searchQuery)
    const vector = vec.map((r)=>{ return r.embedding})
    
    try {
      const result = await this.getClient().search(this.searchQueryCosine(indexName, query, vector))
      return result
    } catch (error) {
      console.error("Error fetching data:", error);
      return { "Error": error }
    }  
  }


  async searchFuzzy(indexName, query = '') {
    const result = await this.getClient().search(this.searchQueryFuzzy(indexName, query))
    return result
  }


  async searchBM25(indexName, query = '') {
    const result = await this.getClient().search(this.searchQueryBM25(indexName, query))
    return result
  }


  async searchRankFusion(indexName, query = '') {
    const searchQuery = query
    const vec = await createVectorFromString(searchQuery)
    const vector = vec.map((r)=>{ return r.embedding})
    const result = await this.getClient().search(this.searchQueryRankFusion(indexName, query, vector))
    return result
  }
}