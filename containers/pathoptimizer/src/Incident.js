import { v4 as uuidv4 } from 'uuid';

import Point2D from './Point2D.js';
import Astar2DAlgorithmn from './Astar2DAlgorithmn.js';

export default class Incident {
    constructor(scene, map, tileSize) {
        this.scene = scene;
        this.map = map;
        this.incidentList = [];
        this.tileSize = tileSize;
    }

    /**
     * Change the size of a tile
     * 
     * @param {*} ts 
     */
    changeTileSize(ts) {
        this.tileSize = ts;
            // Update positions and sizes of existing overlays
        for (let block of this.incidentList) {
            const px = block.x * ts + ts / 2;
            const py = block.y * ts + ts / 2;

            block.overlay.setPosition(px, py);
            block.overlay.setSize(ts, ts);
        }
    }

    /**
     * Get List of incidents
     * @returns 
     */
    getIncidents() {
        return this.incidentList;
    }

    /**
     * Create a incident on a randomposition (place it next to the wall)
     * @returns 
     */
    async createRandomIncident() {
        let tileSize = this.tileSize;
        const map = this.map;
    
        // Collect all wall positions with a walkable tile (0) above or below
        const validWallPositions = [];
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === 1) {
                    const above = y > 0 && map[y - 1][x] === 0;
                    const below = y < map.length - 1 && map[y + 1][x] === 0;
    
                    if (above || below) {
                        validWallPositions.push({ x, y, above, below });
                    }
                }
            }
        }
    
        if (validWallPositions.length === 0) return;
    
        // Pick a random valid wall tile
        const random = Phaser.Math.RND.pick(validWallPositions);
    
        // Determine target overlay position (above or below)
        let targetY = random.y;
        if (random.above && random.below) {
            targetY += Phaser.Math.RND.pick([-1, 1]);
        } else if (random.above) {
            targetY -= 1;
        } else if (random.below) {
            targetY += 1;
        }
    
        // ✅ Check if already exists
        const alreadyHighlighted = this.incidentList.some(b => b.x === random.x && b.y === targetY);
        if (alreadyHighlighted) return;
    
        const px = random.x * tileSize + tileSize / 2;
        const py = targetY * tileSize + tileSize / 2;
    
        // Add red overlay rectangle
        const overlay = this.scene.add.rectangle(px, py, tileSize, tileSize, 0xff0000, 0.5)
            .setDepth(5);
    
        // Store the highlighted position
        const incidentId = uuidv4(); // Generate a unique incident ID
        this.incidentList.push({ id: incidentId, x: random.x, y: targetY, overlay });

        // ✅ Sende an deinen API-Endpunkt
        try {
            console.log("Using backend URL:", import.meta.env.VITE_GENERAL_URL);
            const response = await fetch(`https://millverse-datahub.${import.meta.env.VITE_GENERAL_URL}/incident/insert-incident`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify({
                    incident_id: incidentId
                })
            });
        
            if (!response.ok) {
                // HTTP-level error (e.g., 400 or 500)
                console.error(`Server error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            // Network-level error (e.g., DNS failure, refused connection)
            console.error('Fetch failed:', error);
        }
    }
    
    /**
     * Remove a incident from the list
     * 
     * @param {*} x 
     * @param {*} y 
     */
    remove(x, y) {
        for (let i = 0; i < this.incidentList.length; i++) {
            const block = this.incidentList[i];
            if (block.x === x && block.y === y) {
                if (block.overlay) block.overlay.destroy(); // remove visual
                this.incidentList.splice(i, 1);         // remove from array

                
                // Send fix-incident to backend
                fetch(`https://millverse-datahub.${import.meta.env.VITE_GENERAL_URL}/incident/fix-incident`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    },
                    body: JSON.stringify({
                        incident_id: block.id,
                        fixed_by_user: '123' // You might want to pass this dynamically
                    })
                })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .catch(error => {
                    console.error('Error fixing incident:', error);
                });

                break;
            }
        }
    }

    /**
     * Lock a incident
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} pathColor 
     */
    lock(x, y, pathColor = 0x0000ff) {
        for (let i = 0; i < this.incidentList.length; i++) {
            const block = this.incidentList[i];
            if (block.x === x && block.y === y) {
                this.incidentList[i].lock = true;
                this.incidentList[i].overlay.setFillStyle(pathColor, 0.5); // blue with 50% opacity
                break;
            }
        }
    }

    /**
     * Check if a position is above a incident
     * 
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    aboveBlock(x, y) {
        for (let i = 0; i < this.incidentList.length; i++) {
            const block = this.incidentList[i];
            if (block.x === x && block.y === y) {
                return true;
            }
        }
        return false
    }

    /**
     * Get the closest incident to a given point
     * @param {*} basemap 
     * @param {*} point 
     * @returns 
     */
    getClosestIncident(basemap, point) {
        let closest = [];
        for (const incident of this.incidentList) {
            if (incident.lock) continue; // skip locked blocks

            let path = new Astar2DAlgorithmn(
                new Point2D(incident.x, incident.y),
                point,
                basemap
            );
            
            closest.push({
                x: incident.x,
                y: incident.y,
                pathLength: path.length
            });
        };

        closest.sort((a, b) => a.pathLength - b.pathLength);
                        
        if (closest.length > 0) {
            return closest[0];
        }

        return false;
    }    
}
