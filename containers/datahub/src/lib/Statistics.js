import { Postgres } from './postgres.js';

export class Statistics {
  constructor() {
    this.postgres = new Postgres();
    this.postgres.connect();
  }

  // ************************************************************************************************
  async statisticsAnnotations(text, limit = 5) {
    try {
      const sql = `
          SELECT
            source_table, 
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM annotations), 2) as percentage,
            COUNT(*) as cnt
          FROM annotations
          GROUP BY source_table
          ORDER BY cnt DESC;
          `;

      const result = await this.postgres.client.query(sql);
      return {
        "annotations": result.rows
      };
    } catch (err) {
      console.error(`Error:`, err);
      return false;
    }
  }
}
