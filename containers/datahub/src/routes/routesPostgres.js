import { Postgres } from '../lib/postgres.js';
import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /postgres/tables-get:
 *   get:
 *     summary: Get a list of all tables
 *     description: Get a list of all tables
 *     tags: 
 *       - Postgres
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/tables-get', async (req, res) => {
    const pg01 = await new Postgres();
    //await pg01.connect();    
    res.json({ tables: await pg01.tableShow() });
});

/**
 * @swagger
 * /postgres/table-create:
 *   get:
 *     summary: Create a table
 *     description: Create a table by passing table name and schema as query parameters.
 *     tags: 
 *       - Postgres
 *     parameters:
 *       - in: query
 *         name: table
 *         required: true
 *         default: "test-table"
 *         schema:
 *           type: string
 *         description: The name of the table to create
 *       - in: query
 *         name: schema
 *         required: true
 *         default: "id INT PRIMARY KEY, name TEXT"
 *         schema:
 *           type: string
 *         description: The schema definition (e.g. "id INT PRIMARY KEY, name TEXT")
 *     responses:
 *       200:
 *         description: Table created successfully
 */
router.get('/table-create', async (req, res) => {
    const { table, schema } = req.query;
    try {
        const pg01 = new Postgres();
        await pg01.tableCreate(table, schema);
        const tables = await pg01.tableShow();
        res.json({ status: 'OK', created: table, existingTables: tables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create table', details: error.message });
    }
});

/**
 * @swagger
 * /postgres/table-create-vectortable:
 *   get:
 *     summary: Create a table for storing the vectors
 *     description: Create a table for storing the vectors
 *     tags: 
 *       - Postgres
 *     parameters:
 *       - in: query
 *         name: table
 *         required: true
 *         default: "vector-table"
 *         schema:
 *           type: string
 *         description: The name of the table to create
 *     responses:
 *       200:
 *         description: Table created successfully
 */
router.get('/table-create-vectortable', async (req, res) => {
    const { table } = req.query;
    try {
        const pg01 = new Postgres();

        const schema = 'id SERIAL PRIMARY KEY, '
            + 'source_table VARCHAR(255), '
            + 'source_text_column VARCHAR(255), '
            + 'source_key_column VARCHAR(255), '
            + 'key VARCHAR(255), '
            + 'text TEXT, '
            + 'hashed_text VARCHAR(255), embedding VECTOR(768)';

        await pg01.tableCreate(table, schema);
        const tables = await pg01.tableShow();
        res.json({ status: 'OK', created: table, existingTables: tables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create vector-table', details: error.message });
    }
});

/**
 * @swagger
 * /postgres/table-get-column-names:
 *   get:
 *     summary: get the column-names of a table
 *     description: get the column-names of a table
 *     tags: 
 *       - Postgres
 *     parameters:
 *       - in: query
 *         name: table
 *         required: true
 *         default: "test-table"
 *         schema:
 *           type: string
 *         description: The name of the table to create
 *     responses:
 *       200:
 *         description: Table created successfully
 */
router.get('/table-get-column-names', async (req, res) => {
    const { table } = req.query;
    try {
        const pg01 = new Postgres();
        const result = await pg01.columnsShow(table);
        res.json({ status: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete table', details: error.message });
    }
});


/**
 * @swagger
 * /postgres/table-delete:
 *   get:
 *     summary: Delete a table
 *     description: Delete a table by passing table name
 *     tags: 
 *       - Postgres
 *     parameters:
 *       - in: query
 *         name: table
 *         required: true
 *         default: "test-table"
 *         schema:
 *           type: string
 *         description: The name of the table to create
 *     responses:
 *       200:
 *         description: Table created successfully
 */
router.get('/table-delete', async (req, res) => {
    const { table } = req.query;
    try {
        const pg01 = new Postgres();
        await pg01.tableDrop(table);
        const tables = await pg01.tableShow();
        res.json({ status: 'OK', credeleted: table, existingTables: tables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete table', details: error.message });
    }
});


/**
 * @swagger
 * /postgres/table-truncate:
 *   get:
 *     summary: Truncate a table
 *     description: Truncate a table by passing table name
 *     tags: 
 *       - Postgres
 *     parameters:
 *       - in: query
 *         name: table
 *         required: true
 *         default: "test-table"
 *         schema:
 *           type: string
 *         description: The name of the table to create
 *     responses:
 *       200:
 *         description: Table created successfully
 */
router.get('/table-truncate', async (req, res) => {
    const { table } = req.query;
    try {
        const pg01 = new Postgres();
        await pg01.tableTruncate(table);
        const tables = await pg01.tableShow();
        res.json({ status: 'OK', credeleted: table, existingTables: tables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete table', details: error.message });
    }
});

/**
 * @swagger
 * /postgres/extensions-get:
 *   get:
 *     summary: Delete a table
 *     description: Delete a table by passing table name
 *     tags: 
 *       - Postgres
 *     responses:
 *       200:
 *         description: Table created successfully
 */
router.get('/extensions-get', async (req, res) => {
    try {
        const pg01 = new Postgres();
        const result = await pg01.extensionsShow();        
        res.json({ status: 'OK', extensions: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create table', details: error.message });
    }
});

/**
 * @swagger
 * /postgres/extension-install-vector:
 *   get:
 *     summary: Delete a table
 *     description: Delete a table by passing table name
 *     tags: 
 *       - Postgres
 *     responses:
 *       200:
 *         description: Table created successfully
 */
router.get('/extension-install-vector', async (req, res) => {
    try {
        const pg01 = new Postgres();
        const result = await pg01.extensionInstallVector();        
        res.json({ status: 'OK' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to install vector extension', details: error.message });
    }
});

/**
 * @swagger
 * /postgres/execute-query:
 *   get:
 *     summary: Execute a query
 *     description: Execute a query
 *     tags: 
 *       - Postgres
 *     parameters:
 *       - in: query
 *         name: sql
 *         required: true
 *         default: "SELECT * FROM \"vector-table\" LIMIT 10"
 *         schema:
 *           type: string
 *         description: The sql query to execute
 *     responses:
 *       200:
 *         description: Query executed successfully
 */
router.get('/execute-query', async (req, res) => {
    const { sql } = req.query;
    try {
        const pg01 = new Postgres();
        //const sql = `SELECT * FROM "etl-scheduler"`;
        const result = await pg01.executeQuery(sql);
        res.json({ status: 'OK', result: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to execute query', details: error.message });
    }
});


/**
 * @swagger
 * /postgres/init-tables:
 *   get:
 *     summary: init tables
 *     description: init tables
 *     tags: 
 *       - Postgres
 *     responses:
 *       200:
 *         description: Table created successfully
 */
router.get('/init-tables', async (req, res) => {
    try {
        const pg01 = new Postgres();
        await pg01.tableCreate('incidents',
          'incident_id TEXT, '
          + 'incident_start TIMESTAMP, '
          + 'incident_fix TIMESTAMP, '
          + 'time_to_repair BIGINT, '
          + 'fixed_by_user TEXT');
          res.json({ status: 'OK'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to init table', details: error.message });
    }
});

export default router;
