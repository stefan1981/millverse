
import { EtlScheduler } from '../lib/etl/EtlScheduler.js';
import { EtlProcessScript } from './../lib/etl/EtlProcessScript.js';
import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /etl/execute-etl-script:
 *   get:
 *     summary: Collect data from various sources. The collection-details are in a json file.
 *     description: execute an etl script from a json file
 *     tags: 
 *       - ETL
 *     responses:
 *       200:
 *         description: a json with the statistics.
 */  
router.get('/execute-etl-script', async (req, res) => {
    const etl = new EtlProcessScript();

    console.log("bla");
    // TODO: take here an input script
    const script = etl.getDemoScript();
    const result = await etl.processScript(script);
    console.log(result)
      
    res.send(result);
});


/**
 * @swagger
 * /etl/insert-script-into-scheduler:
 *   post:
 *     summary: store a script in the scheduler
 *     description: Stores a script in the scheduler
 *     tags: 
 *       - ETL
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scriptName:
 *                 type: string
 *               actions:
 *                 type: object
 *           example:
 *             scriptName: "defaultScript"
 *             actions:
 *               limit: 100
 *     responses:
 *       200:
 *         description: ETL script executed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 input:
 *                   type: object
 */
router.post('/insert-script-into-scheduler', async (req, res) => {
    const defaultInput = {
        scriptName: 'defaultScript',
        actions: [
            {
                limit: 100
            }
        ]
    };

    const script = {
        ...defaultInput,
        ...req.body,
        actions: req.body?.actions || defaultInput.actions // deep fallback for nested
    };

    try {
        const etlScheduler = new EtlScheduler();
        await etlScheduler.insertSchedulerEntry(script.scriptName, script, '0 * * * *');

        res.json({ status: 'Script executed', script });
    } catch (err) {
        console.error('Failed to insert scheduler entry:', err);
        res.status(500).json({ error: 'Failed to schedule script execution' });
    }
});

/**
 * @swagger
 * /etl/scheduler-list-entries:
 *   get:
 *     summary: lists all scheduler entries
 *     description: lists all scheduler entries
 *     tags: 
 *       - ETL
 *     responses:
 *       200:
 *         description: lis of scheduler entries
 */
router.get('/scheduler-list-entries', async (req, res) => {
    const etlScheduler = new EtlScheduler();
    const result = await etlScheduler.listSchedulerEntries();
    res.json({ entries: result });
});



export default router;
