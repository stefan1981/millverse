import Point2D from './Point2D.js';
import AstarNode from './AstarNode.js';
import Astar from './Astar.js';
import Astar2DAlgorithmn from './Astar2DAlgorithmn.js';


export default class Mover {
    constructor(scene, map, tileSize = 16, x=0, y=0) {
        this.id = crypto.randomUUID().substring(0, 8);
        //this.name = this.id.substring(0, 8);
        this.scene = scene;
        this.map = map;
        this.tileSize = tileSize;
        this.pathColor = this.getRandomColor();

        this.MILLISECONDS_PER_METER = 100;
        this.MILLISECONDS_PER_REPAIR = 2000;

        this.lastIdleCheck = 0;
        this.lastWalkCheck = 0;

        this.statSteps = 0;
        this.statPieces = 0;

        this.pathGraphics = []; // <-- new array to store path visuals
        this.status = 0; // 1 = moving, 2 = waiting, 3 = repairing
        
        this.curr = new Point2D(x, y);
        //this.curr = this.map.getRandomFreeValueOn2DMap();
        //x = this.curr.getX();
        //y = this.curr.getY();

        // Create circle sprite
        let pos = this.getPixelPosition(this.curr.getX(), this.curr.getY());
        this.circle = this.scene.add.circle(pos.x, pos.y, this.tileSize / 2, this.pathColor)
            .setStrokeStyle(1, 0x000000)
            .setDepth(10);        
        
        this.pathPos = 0;
        this.getNewPoint(x, y);
    }

    /**
     * Change the size of a tile
     * 
     * @param {*} ts 
     */    
    changeTileSize(ts) {
        this.tileSize = ts;
        this.circle.setRadius(ts / 2);
    }

    /**
     * Get the current position of the mover in pixels
     * 
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    getPixelPosition(x, y) {
        let ts = this.tileSize;
        return {
            x: x * ts + ts / 2,
            y: y * ts + ts / 2,
        };
    }

    /**
     * Create a new target point for the mover
     * 
     * @param {*} x 
     * @param {*} y 
     */
    getNewPoint(x = null, y = null) {
        this.start = this.curr;

        if (x == null || y == null) {
            this.end = this.map.getRandomFreeValueOn2DMap();
        } else {
            this.end = new Point2D(x, y);
        }

        this.path = new Astar2DAlgorithmn(this.end, this.start, this.map);
        this.arrFinalWay = this.map.getPathAs2DMap(this.path);
        this.pathPos = 0;
    }
    
    /**
     * Check if the mover is above the target
     * @returns 
     */
    hasTargetReached() {
        if(this.pathPos >= this.path.length) {
            return true;
        }
        return false;
    }

    /**
     * Move the mover to the next target
     */
    moveToTarget() {
        try {
            const node = this.path[this.pathPos];
            const x = node.coord.getX();
            const y = node.coord.getY();
            this.curr.setX(x);
            this.curr.setY(y);
            const pos = this.getPixelPosition(x, y);
            this.circle.setPosition(pos.x, pos.y);
            this.pathPos++;
            this.statSteps = this.statSteps + 1;
        }
        catch (error) {
            console.error("Error accessing path:", error);
        }
    }

    /**
     * Look for the closest incident and set it as new target
     * @param {*} incidents 
     */
    updateSearch(incidents){
        const currentTime = this.scene.time.now;
        // 0: When the mover is in wait status he checks for closest incident
        // Once the closest incident is found, it's beeing locked, so that
        // noboby else can lock it
        if (this.status === 0) {
            // Only once per second
            if (currentTime - this.lastIdleCheck >= 500) {
                //console.log("check for nearby incident");
                let closest = incidents.getClosestIncident(this.map, this.curr);
                if (closest) {
                    incidents.lock(closest.x, closest.y, this.pathColor);
                    this.getNewPoint(closest.x, closest.y);
                    
                    this.status = 1; // moving
                }
                this.lastIdleCheck = currentTime;
            }
        }
    }

    /**
     * Update the mover steps
     */
    updateWalk(){
        const currentTime = this.scene.time.now;

        // 1: walk to the target. During walking the mover doesn't make any
        // decisions. He just walks to the target
        if (this.status == 1) {
            if (currentTime - this.lastWalkCheck >= this.MILLISECONDS_PER_METER) {
                if (this.hasTargetReached()) {                
                    this.status = 2; // reset status
                } else {
                    this.moveToTarget();
                    this.drawPath(this.tileSize);
                }
                this.lastWalkCheck = currentTime;
            }
        }
    }

    /**
     * Update the mover when he is repairing an incident
     * @param {*} incidents 
     */
    updateRepair(incidents){
        // 2: check if incident is at location
        if (this.status === 2) {
            if (incidents.aboveBlock(this.curr.getX(), this.curr.getY())) {
                this.status = 3;
                this.scene.time.delayedCall(this.MILLISECONDS_PER_REPAIR, () => {
                    this.statPieces += 1;
                    incidents.remove(this.curr.getX(), this.curr.getY());
                    this.status = 0;
                });
            }
        }
    }

    /**
     * Draw the movers path
     */
    drawPath(ts) {        
        // Clear previous path visuals
        for (const shape of this.pathGraphics) {
            shape.destroy();
        }
        this.pathGraphics = [];
    
        // Skip the part of the path behind the current position
        for (let i = this.pathPos; i < this.path.length; i++) {
            const node = this.path[i];
            const x = node.coord.getX();
            const y = node.coord.getY();
    
            const isEnd = this.end.getX() === x && this.end.getY() === y;
    
            if (!isEnd) {
                const { x: px, y: py } = this.getPixelPosition(x, y);
    
                const dot = this.scene.add.circle(px, py, ts / 4, this.pathColor)
                    .setStrokeStyle(1, 0x000000)
                    .setDepth(1);
                this.pathGraphics.push(dot);
            }
        }
    
        // End marker
        const { x: ex, y: ey } = this.getPixelPosition(this.end.getX(), this.end.getY());
        const endCircle = this.scene.add.circle(ex, ey, ts / 4, 0xff0000)
            .setStrokeStyle(2, 0x330000)
            .setDepth(2);
        this.pathGraphics.push(endCircle);
    }

    /**
     * Get a random strong visible color
     * @returns 
     */
    getRandomColor() {
        const colors = [
          0xFF0000, // Red
          0x00FF00, // Lime
          0x0000FF, // Blue
          0xFFFF00, // Yellow
          0xFF00FF, // Magenta
          0x00FFFF, // Cyan
          0xFFA500, // Orange
          0x800080, // Purple
          0x008000, // Green
          0x000080, // Navy
          0xFFC0CB, // Pink
          0xFFD700, // Gold
          0x40E0D0, // Turquoise
          0xFF1493, // Deep Pink
          0x7CFC00, // Lawn Green
          0x1E90FF, // Dodger Blue
          0xDC143C, // Crimson
          0x00FA9A, // Medium Spring Green
          0xFF4500, // Orange Red
          0xADFF2F, // Green Yellow
          0x8A2BE2, // Blue Violet
          0x00CED1, // Dark Turquoise
          0xFA8072, // Salmon
          0xDA70D6, // Orchid
          0x7FFF00, // Chartreuse
          0x9932CC, // Dark Orchid
          0xB22222, // Firebrick
          0x20B2AA, // Light Sea Green
          0xFF6347, // Tomato
          0x4169E1  // Royal Blue
        ];
      
        return colors[Math.floor(Math.random() * colors.length)];
      }
}
