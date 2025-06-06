import { Postgres } from '../lib/postgres.js';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();


/**
 * @swagger
 * /incident/insert-incident:
 *   post:
 *     summary: Insert a new incident
 *     description: Inserts a new row into the incidents table
 *     tags: 
 *       - Incidents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - incident_id
 *             properties:
 *               incident_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Incident inserted successfully
 */
router.post('/insert-incident', async (req, res) => {
    try {
        const { incident_id } = req.body;

        if (!incident_id) {
            return res.status(400).json({ error: 'Missing incident_id' });
        }

        const pg01 = new Postgres();
        const incident_start = new Date();

        const query = `
            INSERT INTO incidents (
                incident_id, incident_start, incident_fix, time_to_repair, fixed_by_user
            ) VALUES (
                $1, $2, NULL, NULL, NULL
            )
        `;

        await pg01.query(query, [incident_id, incident_start]);

        res.json({ status: 'Inserted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to insert incident', details: error.message });
    }
});

/**
 * @swagger
 * /incident/fix-incident:
 *   post:
 *     summary: Fix an existing incident
 *     description: Updates an incident with fix timestamp, time to repair, and user
 *     tags: 
 *       - Incidents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - incident_id
 *               - fixed_by_user
 *             properties:
 *               incident_id:
 *                 type: string
 *               fixed_by_user:
 *                 type: string
 *     responses:
 *       200:
 *         description: Incident updated successfully
 */
router.post('/fix-incident', async (req, res) => {
    try {
        const { incident_id, fixed_by_user } = req.body;

        if (!incident_id || !fixed_by_user) {
            return res.status(400).json({ error: 'Missing incident_id or fixed_by_user' });
        }

        const pg01 = new Postgres();

        const incident_fix = new Date();

        const query = `
        UPDATE incidents
        SET 
            incident_fix = $1,
            time_to_repair = EXTRACT(EPOCH FROM ($1 - incident_start)) * 1000,
            fixed_by_user = $2
        WHERE incident_id = $3
        `;

        const result = await pg01.query(query, [
            incident_fix,
            fixed_by_user,
            incident_id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        res.json({ status: 'Incident fixed', incident_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fix incident', details: error.message });
    }
});



export default router;
