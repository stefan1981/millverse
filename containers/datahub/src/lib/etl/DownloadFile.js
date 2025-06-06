import * as fs from 'fs';
import * as https from 'https';
import { Postgres } from './../postgres.js';
import { DataFrame } from './DataFrame.js';


export class DownloadFile {
  constructor() {
    this.postgres = new Postgres();
  }

  // ************************************************************************************************
  async downloadFile(urlPath, filename) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filename);
      https.get(urlPath, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${urlPath}' (status: ${response.statusCode})`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve); // Resolves when done
        });

        file.on('error', (err) => {
          fs.unlink(filename, () => {}); // Cleanup
          reject(err);
        });
      }).on('error', (err) => {
        fs.unlink(filename, () => {});
        reject(err);
      });
    });
  }


  // ************************************************************************************************
  async createTableAndWriteInto(tableName, dataframe) {

    const columns = await dataframe.getColumns();
    const data = await dataframe.getData();
    await this.postgres.tableDrop(tableName);
    
    await this.postgres.tableCreateFromDataFrame(tableName, columns);
    await this.postgres.insertFromDataFrame(tableName, columns, data);
  }  
  // ************************************************************************************************
  async tableDrop(tableName) {
    await this.postgres.tableDrop(tableName);
  }  
  // ************************************************************************************************
}
