import { Postgres } from './postgres.js';

export class Leika {
  constructor() {
    this.postgres = new Postgres();
    this.postgres.connect();
  }

  // ************************************************************************************************
  async getLawTexts(keywords) {
    
    try {
      const query01 = `
        SELECT
          A."Leistungskennung", A."Handlungsgrundlage"
        FROM leika_leistungen AS A
        WHERE A."Handlungsgrundlage" LIKE '%' || $1 || '%' LIMIT 5;
      `;
      const result = await this.postgres.client.query(query01, [keywords]);
      return result.rows;

    } catch (error) {
        console.error('Error:', error);
        return ['Error fetching data'];
    }
  }
  // ************************************************************************************************
  async getLeikaByCode(code) {
    
    try {
      const query01 = `
        SELECT
          *
        FROM leika_leistungen
        WHERE \"Schluessel\" = $1;
      `;
      const result = await this.postgres.client.query(query01, [code]);
      return result.rows;

    } catch (error) {
        console.error('Error:', error);
        return ['Error fetching data'];
    }
  }  
  // ************************************************************************************************
}
