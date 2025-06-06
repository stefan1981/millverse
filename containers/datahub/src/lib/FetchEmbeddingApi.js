import fetch from 'node-fetch';
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

export async function fetchEmbeddingApi(text) {
  const url = 'https://datastore-swagger-fastapi.zahl1.de/vectorize';

  const requestBody = {
    text: text
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching embeddings:', error);
    return { error: error.message };
  }
}