import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EtlAction } from './EtlAction.js';

export class EtlProcessScript {
  constructor() {
  }

  // ************************************************************************************************
  isValidJSON(json) {
    if (typeof json === "string") {
      try {
        JSON.parse(json);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      // Already a JS object
      return true;
    }
  }

  // ************************************************************************************************
  cleanTmpFolder(folder) {
    fs.existsSync(folder) &&
    fs.rmSync(folder, { recursive: true, force: true });
  }

  // // ************************************************************************************************
  generateTimestampedUID() {
    const now = new Date();
    const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, '');
    const hhmmss = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const uid = crypto.randomBytes(4).toString('hex'); // 8-char UID
    return `${yyyymmdd}-${hhmmss}-${uid}`;
  }


  // ************************************************************************************************
  async createTempWorkingFolder() {
    const folderName = this.generateTimestampedUID();
    const tmpDir = path.join('/tmp', folderName);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
      console.log(`Temporary working folder created: ${tmpDir}`);
    }
    return tmpDir;
  }

  // ************************************************************************************************
  async processAction(action, tmpFolder, output) {
    const etlActions = new EtlAction(tmpFolder);
    const methodeNames =  await etlActions.getAllMethodNames();

    if (methodeNames.includes(action.action)) {
      // dont execute action-blocks with disabled parameter
      if (action.disabled) {
        //console.log(`Disabled Action: ${action.action}`);
      } else {
        console.log(`Start Action: ${action.action}`);

        // here the methode name to call is dynamic -> etlActions[methodename](...)
        const result = await etlActions[action.action](action, output);
        if (result) {
          console.log(`End Action: ${action.action}`);
          if (result.error) {
            this.cleanTmpFolder(tmpFolder);
            return { "error": result.error };
          }
          return result;
        }
      }
    } else {
      // if in the EtlAction class is no methode with action.action name
      console.log(`Not implemented: ${action.action}`);
    }
  }
  
  // ************************************************************************************************
  async processScript(script) {
    console.log("---------------------------- ETL Script Execution ----------------------------");
    
    // Todo: store the execution of the script in a table
    
    if (!this.isValidJSON(script)) {
      return { "error": "invalid json" };
    }
    
    if (!Object.prototype.hasOwnProperty.call(script, 'actions')) {
      return { "error": "script has no actions element" };      
    }
    
    if (!Array.isArray(script.actions)) {
      return { "error": "actions element is not an array" };
    }
    
    const tmpFolder = await this.createTempWorkingFolder();

    let output = null;
    for (const action of script.actions) {
      output = await this.processAction(action, tmpFolder, output);

      // If output contains an error, stop execution
      if (output && output.error) {
        this.cleanTmpFolder(tmpFolder);
        return output; // or return { error: output.error } if you want to format it
      }
    }
    this.cleanTmpFolder(tmpFolder);
    return { "status" : "okay"}
  }


  // ************************************************************************************************
  getDemoScript() {
    return {
      "actions" : [
        // leika from fimportal
        { "action": "fileDownload", "targetFileName": "leika.zip", "url": "https://fimportal.de/kataloge/leika_leistungen_de.csv.zip" },
        { "action": "unzipFile", "sourceFileName": "leika.zip" },
        { "action": "readCsv", "fileName": "leika_leistungen_de.csv", "encoding": "iso-8859-1" },
        { "action": "writeToDb", "value": "leika_leistungen" },
        
        // wz-codes from destatis
        { "disabled": true, "action": "waitSeconds", "value": "2"},
        {
          "action": "fileDownload", "targetFileName": "wzcodes.xlsx",
          "url": "https://www.destatis.de/DE/Methoden/Klassifikationen/Gueter-Wirtschaftsklassifikationen/Downloads/gliederung-klassifikation-wz-3100130259005.xlsx?__blob=publicationFile&v=5",
        },
        { "action": "readExcel", "fileName": "wzcodes.xlsx", "sheetNr": 1 },
        { "action": "writeToDb", "value": "wzcodes" },

        // wztest10
        { "disabled": true, "action": "waitSeconds", "value": "2" },
        { "action": "fileCopy", "sourceFileName": "/app/src/data/local-files/wztest10.csv", "targetFileName": "wztest10.csv" },
        { "action": "readCsv", "fileName": "wztest10.csv" },
        { "action": "writeToDb", "value": "wztest10" },
     

        // // leika wsp
        // { "disabled": true, "action": "waitSeconds", "value": "2" },
        // { "action": "fileCopy", "sourceFileName": "/app/src/data/local-files/leika_wsp.xlsx", "targetFileName": "leika_wsp.xlsx" },
        // { "action": "readExcel", "fileName": "leika_wsp.xlsx", "sheetNr": 0 },
        // { "action": "writeToDb", "value": "leika_wsp" },

        // // wz_codes
        // { "disabled": true, "action": "waitSeconds", "value": "2" },
        // { "action": "fileCopy", "sourceFileName": "/app/src/data/local-files/WZ_2008.csv", "targetFileName": "wz.csv" },
        // { "action": "readCsv", "fileName": "wz.csv" },   
        // { "action": "writeToDb", "value": "wz_codes" },

        // // wz_codes keywords
        // { "disabled": true, "action": "waitSeconds", "value": "2" },
        // { "action": "fileCopy", "sourceFileName": "/app/src/data/local-files/WZ_2008-keywords.csv", "targetFileName": "wz-keywords.csv" },
        // { "action": "readCsv", "fileName": "wz-keywords.csv" },   
        // { "action": "writeToDb", "value": "wz_code_stichwörter" },

        // // business matrix
        // { "disabled": true, "action": "waitSeconds", "value": "2" },
        // { "action": "fileCopy", "sourceFileName": "/app/src/data/local-files/Business-Matrix.xlsx", "targetFileName": "bm.xlsx" },
        // { "action": "readExcel", "fileName": "bm.xlsx", "sheetNr": 0 },
        // { "action": "writeToDb", "value": "business_matrix" },

      ]
    };
  }
}


// ,
//         {
//           "action": "show",
//           "value": ""
//         }