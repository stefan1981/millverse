import pool from './postgresPool.js';

import pkg from 'pg';
//const { Client } = pkg;
const {Pool} = pkg;


/*
*        connect                      // connect to db
*        close                        // close connection to db
*        tableCreate                  // create a table
*        tablesShow                   // show list of all tables
*        tableDrop                    // delete table
*        tableExists                  // check if table exists
*        countRecords                 // shows the record count of a table
*        selectData                   // select data from db with a query
*        columnsShow                  // shows the columns of a table
*        columnAdd                    // add a column to a table
*        ...
*/

export class Postgres {
    constructor() {
        this.pool = pool;

        // const conf = {
        //     user: process.env.POSTGRES_USER,
        //     host: process.env.POSTGRES_HOST,
        //     database: process.env.POSTGRES_DATABASE,
        //     password: process.env.POSTGRES_PASSWORD,
        //     port: 5432,
        // }
        // this.pool = new Pool(conf);
    }


    // ************************************************************************************************
    async tableCreate(tableName, schema) {        
        const client = await this.pool.connect();
        const query = `CREATE TABLE IF NOT EXISTS "${tableName}"
                       (
                           ${schema}
                       )`;
        try {
            await client.query(query);
        } catch (err) {
            console.error(`Error creating table ${tableName}`, err);
        } finally {
            client.release();
        }
    }


    // ************************************************************************************************
    async tableCreateFromDataFrame(tableName, columns) {
        if (!Array.isArray(columns) || columns.length === 0) {
            console.error('Invalid columns array passed to tableCreateFromDataFrame');
            return;
        }

        const schema = columns.map(col => `"${col}" TEXT`).join(', ');
        const query = `CREATE TABLE IF NOT EXISTS "${tableName}"
                       (
                           ${schema}
                       )`;

        const client = await this.pool.connect();
        try {
            await client.query(query);
        } catch (err) {
            console.error(`Error creating table ${tableName}`, err);
        } finally {
            client.release();
        }
    }


    // ************************************************************************************************
    async insertFromDataFrame(tableName, columns, data, chunkSize = 500) {
        if (!Array.isArray(data) || data.length === 0) {
            console.error('No data provided for insertion.');
            return;
        }

        const totalBatches = Math.ceil(data.length / chunkSize);

        const client = await this.pool.connect();
        try {
            for (let i = 0; i < totalBatches; i++) {
                const batch = data.slice(i * chunkSize, (i + 1) * chunkSize);
                const flatValues = batch.flat();

                const placeholders = batch.map((row, rowIndex) => {
                    const baseIndex = rowIndex * columns.length;
                    const rowPlaceholders = row.map((_, colIndex) => `$${baseIndex + colIndex + 1}`);
                    return `(${rowPlaceholders.join(', ')})`;
                }).join(', ');

                const query = `INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')})
                               VALUES ${placeholders}`;

                await client.query(query, flatValues);
            }
        } catch (err) {
            console.error(`Error inserting into ${tableName}`, err);
        } finally {
            client.release();
        }
    }


    // ************************************************************************************************
    async tableShow() {
        const client = await this.pool.connect();
        const query = `SELECT table_name
                       FROM information_schema.tables
                       WHERE table_schema = 'public'
                       ORDER BY table_name;`;
        try {
            const result = await client.query(query);
            return result.rows.map(row => row.table_name);
        } catch (err) {
            console.error("Error retrieving tables", err);
            return [];
        } finally {
            client.release();
        }
    }


    // ************************************************************************************************
    async tableDrop(tableName) {
        const client = await this.pool.connect();
        const query = `DROP TABLE IF EXISTS "${tableName}";`;
        try {
            await client.query(query);
        } catch (err) {
            console.error(`Error dropping table ${tableName}`, err);
        } finally {
            client.release();
        }
    }

    // ************************************************************************************************
    async tableTruncate(tableName) {
        const client = await this.pool.connect();
        const query = `TRUNCATE TABLE "${tableName}";`;
        try {
            await client.query(query);
        } catch (err) {
            console.error(`Error truncating table ${tableName}`, err);
        } finally {
            client.release();
        }
    }


    // ************************************************************************************************
    async tableExists(tableName) {
        const client = await this.pool.connect();
        const query = `SELECT EXISTS (
                                SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1
                              )`;

        try {
            const result = await client.query(query, [tableName]);
            return result.rows[0]?.exists || false;
        } catch (err) {
            console.error(`Error checking if table ${tableName} exists`, err);
            return false;
        } finally {
            client.release();
        }
    }


    // ************************************************************************************************
    async countRecords(tableName) {
        const client = await this.pool.connect();
        const query = `SELECT COUNT(*)
                       FROM "${tableName}"`;

        try {
            const result = await client.query(query);
            return parseInt(result.rows[0]?.count, 10) || 0;
        } catch (err) {
            console.error(`Error getting record count from ${tableName}`, err);
            return 0;
        } finally {
            client.release();
        }
    }


    // ************************************************************************************************
    async selectData(query, params = []) {
        const client = await this.pool.connect();
        try {
            return await client.query(query, params);
        } catch (err) {
            console.error(`Error:`, err);
            // throw err; // here?
            return false;
        } finally {
            client.release();
        }
    }


    // ************************************************************************************************
    // This function is a wrapper for selectData - less confusing name.
    async query(sql, params = []) {
        return this.selectData(sql, params);
    }


    // ************************************************************************************************
    async columnsShow(tableName) {
        const client = await this.pool.connect();
        const query = `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = $1
        `;

        try {
            const result = await client.query(query, [tableName]);
            return result.rows.map(row => row.column_name);
        } catch (err) {
            console.error(`Error retrieving columns for table ${tableName}`, err);
            return [];
        } finally {
            client.release();
        }
    }


    // ************************************************************************************************
    async columnAdd(tableName, columnName, columnType) {
        const client = await this.pool.connect();
        const query = `ALTER TABLE "${tableName}"
            ADD COLUMN IF NOT EXISTS "${columnName}" ${columnType}`;

        try {
            await client.query(query);
        } catch (err) {
            console.error(`Error adding column ${columnName} to table ${tableName}`, err);
        } finally {
            client.release();
        }
    }
    // ************************************************************************************************
    async extensionsShow() {
      const client = await this.pool.connect();
      const query = `SELECT * FROM pg_extension`;
      try {
        const result = await client.query(query);
        
        return result.rows;
      } catch (err) {
        console.error(`Error getting extensions`, err);
        return 0;
      }
    }
    // ************************************************************************************************
    async extensionInstallVector() {
      const client = await this.pool.connect();
      const query = `CREATE EXTENSION IF NOT EXISTS vector`;
      try {
        await client.query(query);
      } catch (err) {
        console.error(`Error installing vector extension`, err);
        return 0;
      }
    }
    // ************************************************************************************************
    async executeQuery(query, params = []) {
      const client = await this.pool.connect();
      try {
        const result = await client.query(query, params);
        //console.log(`Query executed successfully:`, result);
        return result.rows;
      } catch (err) {
        console.error('Error executing query:', query, err);
        throw err;
      }
    }    
}