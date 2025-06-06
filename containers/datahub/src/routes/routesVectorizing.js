import { Vectorizing } from '../lib/Vectorizing.js';
import express from 'express';

const router = express.Router();


/**
 * @swagger
 * /vectorizing/copy-data-to-vector-table:
 *   get:
 *     summary: copy data from a table to vector-table
 *     description: Takes a text column and an ID column from a table and stores the embeddings in a vector table.
 *     tags: 
 *       - vectorizing
 *     parameters:
 *       - in: query
 *         name: tablename
 *         default: wztest10
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the table to read from
 *       - in: query
 *         name: textColumn
 *         default: word
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the text column to vectorize
 *       - in: query
 *         name: idColumn
 *         default: key
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the ID column to associate with the vectors
 *     responses:
 *       200:
 *         description: Returns a result message after vectorization
 */
router.get('/copy-data-to-vector-table', async (req, res) => {
    const { tablename, textColumn, idColumn } = req.query;

    try {
        const semantic = new Vectorizing();
        const result = await semantic.copyDataToVectorTable(tablename, textColumn, idColumn);
        res.send(result);        
    } catch (error) {
        res.status(500).send({ error: 'Vectorization failed', details: error.message });
    }
});


/**
 * @swagger
 * /vectorizing/start-vectorization:
 *   get:
 *     summary: start to vectorize data in vector-table
 *     description: start to vectorize data in vector-table
 *     tags: 
 *       - vectorizing
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */  
router.get('/start-vectorization', async (req, res) => {
    try {
        const semantic = new Vectorizing();
        const result = await semantic.columnVectorize();
        res.send(result);        
    } catch (error) {
        res.status(500).send({ error: 'Vectorization failed', details: error.message });
    }
});


/**
 * @swagger
 * /vectorizing/statistics-vector-table:
 *   get:
 *     summary: show which tables are vectorized
 *     description: show which tables are vectorized
 *     tags: 
 *       - vectorizing
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */  
router.get('/statistics-vector-table', async (req, res) => {
    try {
        const semantic = new Vectorizing();
        const result = await semantic.statisticsVectorTable();
        res.send(result);        
    } catch (error) {
        res.status(500).send({ error: 'Vectorization failed', details: error.message });
    }
});



/**
 * @swagger
 * /vectorizing/search:
 *   get:
 *     summary: iterates over some wz-codes and search to each wz-code a leika-code
 *     description: iterates over some wz-codes and search to each wz-code a leika-code
 *     tags: 
 *       - vectorizing
 *     parameters:
 *       - in: query
 *         name: tablename
 *         default: wztest10
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the table to read from* 
 *       - in: query
 *         name: text
 *         schema:
 *           type: string
 *           default: "Schusswaffen"
 *         required: true
 *         description: The text to generate embeddings for*  * 
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */  
router.get('/search', async (req, res) => {
    
    const { tablename, text } = req.query;    
    const vectorizing = new Vectorizing();
    const result = await vectorizing.searchSpecificTable(tablename, text);
    res.send(result);
});

// /**
//  * @swagger
//  * /mapping/mapping-from-wz-to-leika-by-wz-code:
//  *   get:
//  *     summary: Maps a WZ code to relevant Leika codes using semantic and structural links
//  *     description: >
//  *       Performs a mapping from a given WZ code to relevant Leika codes using multiple approaches:
//  *
//  *       - Retrieves WZ metadata by code
//  *       - Performs semantic search on `wz_code_stichwörter_grouped` to find descriptive text
//  *       - Performs semantic search on `leika_wsp` to suggest relevant services
//  *       - Looks up related professions and their official Leika codes via the BusinessMatrix
//  *       - Identifies Leika codes common across all professions
//  *
//  *       Returns both human-readable and machine-readable outputs.
//  *     tags:
//  *       - mapping
//  *     parameters:
//  *       - in: query
//  *         name: text
//  *         schema:
//  *           type: string
//  *           default: "81.21.0"
//  *         required: true
//  *         description: The WZ code (e.g. "81.21.0") to map to Leika services
//  *     responses:
//  *       200:
//  *         description: Returns WZ metadata, semantic matches, business matrix mappings, and Leika WSP suggestions
//  *         content:
//  *           application/json:
//  *             example:
//  *               wz_code: "81.21.0"
//  *               wz_name: "Allgemeine Gebäudereinigung"
//  *               leika_text: "Baufeinreinigung ..."
//  *               leika_wsp_result:
//  *                 text: "Bewachungsgewerbe Erlaubnis"
//  *                 key: "99050004005000"
//  *                 score: "0.60"
//  *               mappings:
//  *                 - "81.21.0 → Gebäudereiniger - 99050012104000 / 99058017060000"
//  *               mappings_structured:
//  *                 - wz_code: "81.21.0"
//  *                   bezeichnung: "Gebäudereiniger"
//  *                   leika_codes:
//  *                     - "99050012104000"
//  *                     - "99058017060000"
//  *               common_leika_codes:
//  *                 - "99050012104000"
//  *               leika_wsp_results:
//  *                 - text: "Bewachungsgewerbe Erlaubnis"
//  *                   key: "99050004005000"
//  *                   score: "0.60"
//  *                   source_table: "leika_wsp"
//  *                 - text: "Gaststättengewerbe Gestattung"
//  *                   key: "99025002056000"
//  *                   score: "0.66"
//  *                   source_table: "leika_wsp"
//  */
// router.get('/mapping-from-wz-to-leika-by-wz-code', async (req, res) => {
//     const { text } = req.query;
//     const semantic = new SemanticMapping();
//     const result = await semantic.mappingFromWzToLeikaByWzCode(text);
//     res.send(result);
// });

// /**
//  * @swagger
//  * /mapping/mapping-from-wz-to-leika:
//  *   get:
//  *     summary: iterates over some wz-codes and search to each wz-code a leika-code
//  *     description: iterates over some wz-codes and search to each wz-code a leika-code
//  *     tags: 
//  *       - mapping
//  *     responses:
//  *       200:
//  *         description: Returns a mysterious string.
//  */  
// router.get('/mapping-from-wz-to-leika', async (req, res) => {
//     //const { text } = req.query;    
//     const semantic = new SemanticMapping();
//     const result = await semantic.mappingFromWzToLeika();
//     res.send(result);
// });


export default router;
