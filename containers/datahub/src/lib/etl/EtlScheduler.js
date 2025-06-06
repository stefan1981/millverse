//import { createVectorFromString } from '../Vectorizer.js';
import { Postgres } from '../postgres.js';
import pkg from 'pg';
const { Client } = pkg;


export class EtlScheduler {

  constructor() {
    this.db = new Postgres();
  }

  // ************************************************************************************************
  async startBackgroundScheduler(intervalSec = 5) {
    setInterval(() => {
      console.log(`[${new Date().toISOString()}] Running background task...`);
      // Your async logic can go here
      // e.g., fetch data, clean up DB, send a request, etc.
    }, intervalSec * 1000); // every 30 seconds
  }

  // ************************************************************************************************
  async createSchedulerTable() {
    const query = `
      id SERIAL PRIMARY KEY,
      script_name TEXT NOT NULL,
      script_json JSONB,
      crontab TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `;
    
    try {
      await this.db.tableCreate('etl-scheduler', query);
    } catch (err) {
      console.error('Error creating scheduler table', err);
    }
  }

  // ************************************************************************************************
  async insertSchedulerEntry(scriptName, scriptJson, crontab) {
    const query = `
      INSERT INTO "etl-scheduler" (script_name, script_json, crontab)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [scriptName, scriptJson, crontab];

    try {
      await this.db.tableTruncate('etl-scheduler');
      const result = await this.db.executeQuery(query, values);
      return result;
    } catch (err) {
      console.error('Error inserting into etl-scheduler', err);
      throw err;
    }
  }
  // ************************************************************************************************
  async listSchedulerEntries() {
    try {
      const sql = `SELECT * FROM "etl-scheduler"`;
      const result = await this.db.executeQuery(sql, []);

      return result;
    } catch (err) {
      console.error('Error inserting into etl-scheduler', err);
      throw err;
    }
  }

  
  // ************************************************************************************************
  async connect() {
    try {
      await this.client.connect();
    } catch (err) {
      console.error('Error connecting to the database', err);
    }
  }

}