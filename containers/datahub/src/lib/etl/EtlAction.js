import { DownloadFile } from './DownloadFile.js';
import { DataFrame } from './DataFrame.js';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import { copyFile } from 'fs/promises';
import iconv from 'iconv-lite';
import Papa from 'papaparse';
import xlsx from 'xlsx';

export class EtlAction {
  
  constructor(tmpFolder) {
    this.tmpFolder = tmpFolder;
  }

  // ************************************************************************************************
  getAllMethodNames() {

    const exclude = ['toBeExcluded', 'anotherOne'];

    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(
        name => typeof this[name] === 'function' &&
        name !== 'constructor'
      );

    return methodNames;
  }

  // ************************************************************************************************
  async fileDownload(action) {    
    const dl = new DownloadFile();

    if (!action.url) {
      return { "error": `No parameter "url" provided in action: ${action.action}` };
    }
    if (!action.targetFileName) {
      return { "error": `No parameter "targetFileName" provided in action: ${action.action}` };
    }
    const url01 = action.url;
    const source01 = `${this.tmpFolder}/${action.targetFileName}`;
    
    await dl.downloadFile(url01, source01);
  }
  // ************************************************************************************************
  async fileCopy(action) {    
    if (!action.sourceFileName) {
      return { "error": `No parameter "sourceFileName" provided in action: ${action.action}` };
    }
    if (!action.targetFileName) {
      return { "error": `No parameter "targetFileName" provided in action: ${action.action}` };
    }

    // check if file exists
    if (!fs.existsSync(`${action.sourceFileName}`)) {
      return { "error": `The file ${action.sourceFileName} does not exist` };
    }
    try {
      //const target = `${this.tmpFolder}/${action.targetFileName}`;
      await copyFile(action.sourceFileName, `${this.tmpFolder}/${action.targetFileName}`);
      console.log('File copied successfully');
    } catch (err) {
      console.error('Error copying file:', err);
    }    
  }
  // ************************************************************************************************  
  async readExcel(action) {
    let sheetNr = 0;
    let limit = 0;
    if (!action.fileName) {
      return { "error": `No parameter "fileName" provided in action: ${action.action}` };
    }
    if (action.sheetNr) {
      sheetNr = action.sheetNr;
    }
    if (action.limit) {
      limit = action.limit;
    }
  
    // check if file exists
    if (!fs.existsSync(`${this.tmpFolder}/${action.fileName}`)) {
      return { "error": `The file ${this.tmpFolder}/${action.fileName} does not exist` };
      //console.error('File does not exist:', path);
    }

    const workbook = xlsx.readFile(`${this.tmpFolder}/${action.fileName}`);
    const sheetNames = workbook.SheetNames;
  
    // Step 1: Read the entire sheet as raw rows (arrays)
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[sheetNr]], { header: 1 }); // raw array data
  
    // Check if there's data
    if (rows.length === 0) {
      return { "error": `No data found in sheet nr: ${sheetNr}` };
    }
  
    // Step 2: Extract the first row (index 0) as column headers
    const firstRow = rows[0];
  
    //console.log(`First row fields: ${firstRow.join(', ')}`);
  
    // Step 3: Convert rows into an array of objects using the first row as keys
    const allKeys = firstRow; // Column names from the first row
  
    // Step 4: Create data rows, where each row is an object with the proper column keys
    const data = rows.slice(1).map(row => {
      const obj = {};
      allKeys.forEach((key, i) => {
        obj[key] = row[i] ?? null; // use null if the key is missing in the row
      });
      return obj;
    });
  
    // Step 5: If limit is provided, slice the data to the limit
    if (limit > 0) {
      data.splice(limit); // truncate to limit
    }
  
    // Step 6: Put the data into the DataFrame
    const df = await new DataFrame(data).init();
  
    // Return the DataFrame
    return df;
  }

  // ************************************************************************************************
  async unzipFile(action) {    
    if (!action.sourceFileName) {
      return { "error": `No parameter "sourceFileName" provided in action: ${action.action}` };
    }

    try {
      const zip = new AdmZip(`${this.tmpFolder}/${action.sourceFileName}`);
      zip.extractAllTo(`${this.tmpFolder}`, true);
    } catch (err) {
      console.error('Unzip failed:', err);
    }    
  }

  // ************************************************************************************************
  async readCsv(action) {
    let encoding = 'utf8';
    let limit = 0;

    if (!action.fileName) {
      return { "error": `No parameter "fileName" provided in action: ${action.action}` };
    }    
    if (action.encoding) {
      encoding = action.encoding;
    }    
    if (action.limit) {
      limit = action.limit;
    }    
    const csvFile = fs.readFileSync(`${this.tmpFolder}/${action.fileName}`);
    const decodedData = iconv.decode(csvFile, encoding); // Oder 'iso-8859-1'

    const parsedData = await Papa.parse(decodedData, {
      header: true,  // Treat first row as headers
      skipEmptyLines: true,  // Skip empty lines
      dynamicTyping: true,  // Convert types automatically
    });

    if (limit > 0) {
        return new DataFrame(parsedData.data.slice(0, limit));
    } else {
        return new DataFrame(parsedData.data);
    }
  }

  // ************************************************************************************************
  async writeToDb(action, input) {
    if (!action.value) {
      return { "error": `No parameter "value" provided in action: ${action.action}` };
    } 
    const dl = new DownloadFile();
    try {
      if (!(input instanceof DataFrame)) {
        return { "error": `Input is not a DataFrame in action: ${action.action}` };
      }
      await dl.createTableAndWriteInto(action.value, input);
    }
    catch (err) {
      return { "error": `Error checking input type: ${err.message}` };
    }

  }

  // ************************************************************************************************
  async tableDrop(action) {
    if (!action.value) {
      return { "error": `No parameter "value" provided in action: ${action.action}` };
    } 
    const dl = new DownloadFile();
    await dl.tableDrop(action.value);
  }
  // ************************************************************************************************
  async waitSeconds(action) {
    if (!action.value) {
      return { "error": `No parameter "value" provided in action: ${action.action}` };
    }    
    return new Promise(resolve => setTimeout(resolve, action.value * 1000));
  }

  // ************************************************************************************************
  async show(action, input) {
    console.log(`Start: ${action.action}`);
    if (input) {
      console.log(input);
    }
    console.log(`Todo: ${action.action}`);
  }
}
