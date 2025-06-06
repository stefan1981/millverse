//const defaultIndexName = 'wsp_sea_tables_with_annotations';
const defaultIndexName = 'wz_api_dida';
export const swaggerOptions =
{
  "openapi": "3.0.0",
  "info": {
    "title": "semantic-mapper-api",
    "version": "1.0.0",
    "description": "An api for interacting with databse and vectorization"
  },
  "components": {
    "securitySchemes": {
      "ApiKeyAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "X-API-KEY"
      }
    },
    "schemas": {
    }      
  },
  "paths": {
    "/pg-start": {
      "get": {
        "summary": "postgres test",
        "tags": ["postgres"],
        "responses": {
          "200": {
            "description": "All the index are shown"
          }
        }
      }
    },
    "/vectorize-text": {
      "get": {
        "summary": "Vectorizes a text",
        "tags": ["vectorization"],
        "parameters": [
          {
              "in": "query",
              "name": "text",
              "schema": {
                  "type": "string",
                  "default": "Dieser Text wird vektorisiert"
              }
          }          
        ],
        "responses": {
          "200": {
            "description": "Text has been vectorized"
          }
        }
      }
    }
        
  }
}

export const customSwaggerCSS = {
  customCss: '.topbar { display: none; }',
  customSiteTitle: 'Swagger-node'
}

export function validateApiKey (req, res, next) {
  const apiKey = req.header('X-API-KEY');
  
  if (!apiKey || apiKey !== process.env.SWAGGER_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};