import { Postgres } from './postgres.js';

export class WzCodes {
  constructor() {
    this.postgres = new Postgres();
    this.postgres.connect();
  }

  // ************************************************************************************************
  async getByCode(value) {
    
    try {
      const sql = `
        SELECT
          *
        FROM wz_codes
        WHERE wz_code = $1;
      `;
      const result = await this.postgres.client.query(sql, [value]);
      return result.rows;

    } catch (error) {
        console.error('Error:', error);
        return ['Error fetching data'];
    }
  }
  // ************************************************************************************************
}