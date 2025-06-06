import { Postgres } from './postgres.js';
import { Leika } from './Leika.js';

export class BusinessMatrix {
  constructor() {
    this.postgres = new Postgres();
    this.postgres.connect();
  }
  // ************************************************************************************************
  async isWzCodeInBusinessMatrix(wzCode) {
    const query = `
      SELECT "WZ2008_1" FROM business_matrix WHERE "WZ2008_1" = $1;`;
    const result = await this.postgres.client.query(query, [wzCode]);
    if (result.rows.length > 0) {
      return true
    }

    return false;
  }
  // ************************************************************************************************
    async searchBusinessMatrix(text, limit = 5, showFull = true) {
      const leika = new Leika();
      try {
        const sql = `
            SELECT
              "Bezeichnung", "Kurzbeschreibung", "WZ2008_1",
              "Leika_Schl_ssel_Gr_ndung_1" AS LeikaCode01,
              "Leika_Schl_ssel_Gr_ndung_2" AS LeikaCode02,
              "Leika_Schl_ssel_Gr_ndung_3" AS LeikaCode03,
              "Leika_Schl_ssel_Gr_ndung_4" AS LeikaCode04,
              "Leika_Schl_ssel_Gr_ndung_5" AS LeikaCode05
            FROM business_matrix
            WHERE LOWER("Bezeichnung") LIKE LOWER('%${text}%') LIMIT ${limit};`;

        const result = await this.postgres.client.query(sql);

        console.log(result.rows);
        

        if (result.rows.length == 0) {
           console.log("No business_matrix found for searchWord");          
        } else {
          for (const row of result.rows) {
            for (let i=1; i<=5; i++) {
              if (row[`leikacode0${i}`] === null) {
                continue;
              }
              const leikaTmp = await leika.getLeikaByCode(row[`leikacode0${i}`]);
              //console.log(`compact: ${compact}`);
              if (showFull) {
                row[`leikacode0${i}`] = {
                  "code": row[`leikacode0${i}`],
                  "name": leikaTmp[0]?.Bezeichnung ?? "Existiert nicht" // Fallback value if undefined
                };
              } else {
                const bezTmp = leikaTmp[0]?.Bezeichnung ?? "Existiert nicht";
                row[`leikacode0${i}`] = row[`leikacode0${i}`] + " - " + bezTmp;
              }
            }
          }
        }

        return {
          "business_matrix": result.rows
        };
      } catch (err) {
        console.error(`Error:`, err);
        return false;
      }
    }
    // ************************************************************************************************
    async getDetailsForWz(wzCode) {
      const query = `
        SELECT
          "Bezeichnung", "WZ2008_1",
          "Leika_Schl_ssel_Gr_ndung_1",
          "Leika_Schl_ssel_Gr_ndung_2",
          "Leika_Schl_ssel_Gr_ndung_3",
          "Leika_Schl_ssel_Gr_ndung_4",
          "Leika_Schl_ssel_Gr_ndung_5",
          "Leika_Schl_ssel_Gr_ndung_6",
          "Leika_Schl_ssel_Gr_ndung_7",
          "Leika_Schl_ssel_Gr_ndung_8",
          "Leika_Schl_ssel_Gr_ndung_9",
          "Leika_Schl_ssel_Gr_ndung_10"
        FROM business_matrix WHERE "WZ2008_1" = $1;
      `;
      const result = await this.postgres.client.query(query, [wzCode]);
      return result.rows;
    }    
  // ************************************************************************************************
  async hasWzCodeThisLeika(wzCode, leikaCode) {
    const query = `
      SELECT
        *
      FROM business_matrix
      WHERE "WZ2008_1" = $1;
    `;
    const result = await this.postgres.client.query(query, [wzCode]);
    
    let hasLeika = false;
    for (const row of result.rows) {
      for (const key in row) {
        if (row[key] === leikaCode) {
          hasLeika = true;
          break;
        }
      }
    }

    return hasLeika;
  }  
  // ************************************************************************************************
}
