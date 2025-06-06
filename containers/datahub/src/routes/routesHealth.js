import express from 'express';

const router = express.Router();


/**
 * @swagger
 * /health/health:
 *   get:
 *     summary: Check API health status
 *     description: Returns the status of the API
 *     tags: 
 *       - Health
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/health', (req, res) => {
    console.log('Health endpoint hit!');
    res.json({ status: 'OK', uptime: process.uptime() });
});

export default router;
