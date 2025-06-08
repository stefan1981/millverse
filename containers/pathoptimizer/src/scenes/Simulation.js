import Phaser from 'phaser';
import BaseMap from '../BaseMap';
import Mover from '../Mover';
import Incident from '../Incident';
import InformationBoard from '../InformationBoard';

export default class Simulation extends Phaser.Scene {
    constructor() {
        super('Simulation');
        this.tileSize = 13;
        this.informationBoard = new InformationBoard();
        this.informationBoard.loadMoverTable();
        this.informationBoard.loadIncidentTable();
        this.loadControlElements();

        this.lastSpawnTime = 0;
        this.lastSearchTime = 0;
        this.autoSpawn = false;

        this.currentFloorplan = "floor2";
        this.controlRun = true;
    }
    
    /**
     * Preload assets for the scene.
     */
    create() {
        this.reInit(this.currentFloorplan);
        // Listen to resize
        window.addEventListener('resize', () => {
            this.scale.resize(window.innerWidth, window.innerHeight);
            
            this.autoFitMapToScreen();
        });        
    }
    
    /**
     * Add a new Mover to the scene.
     * 
     * @param {*} amount of Movers to add
     */
    addMovers(amount = 1) {
        for (let i = 1; i <= amount; i++) {
            const mover01 = new Mover(this, this.basemap, this.tileSize, 1, 1);
            this.movers.push(mover01);
        }
    }

    /**
     * Init the scene with a new floorplan.
     * 
     * @param {*} the name of the floorPlan to load
     */
    reInit(floorPlan) {
        this.children.removeAll(); // remove existing tiles
        this.autoSpawn = false;
        const autoSpawnCheckbox = document.getElementById('autoSpawn');
        autoSpawnCheckbox.checked = false;

        this.basemap = new BaseMap(floorPlan);
        //this.tileSize = this.basemap.getTileSize();
        this.basemap.drawMap(this, this.tileSize);

        this.resizeCanvas();


        this.movers = [];
        this.addMovers(4);
        this.incidents = new Incident(this, this.basemap.getMap(), this.tileSize);
        this.autoFitMapToScreen();
    }

    resizeCanvas() {
        // Dynamically resize canvas
        const width = this.basemap.getWidth() * this.tileSize;
        const height = this.basemap.getHeight() * this.tileSize;
        this.scale.resize(width, height);  // Resizes the Phaser canvas

        // Update world bounds and camera
        this.cameras.main.setBounds(0, 0, width, height);
        this.cameras.main.setViewport(0, 0, width, height);
        this.cameras.main.centerOn(width / 2, height / 2);
    }


    /**
     * update the scene
     */
    update() {
        
        if (!this.controlRun) {
            return;
        }

        // optimized incident-seach
        // search through all waiting movers,
        // send those to the incident which is closest to it
        if (this.time.now - this.lastSearchTime >= 20) {
            const arrClosest = this.movers
                .filter(m => m.status === 0)
                .map(m => {
                    const closest = this.incidents.getClosestIncident(this.basemap, m.curr);
                    // return all elements from closest and add the mover
                    return closest ? { ...closest, mover: m } : null;
                })
                .filter(Boolean)  // remove all empty values
                .sort((a, b) => a.pathLength - b.pathLength);

            if (arrClosest.length > 0) {
                const best = arrClosest[0];
                const mover = best.mover;
                this.incidents.lock(best.x, best.y, mover.pathColor);
                mover.getNewPoint(best.x, best.y);
                mover.status = 1;
            }
            this.lastSearchTime = this.time.now;
        }

        // unoptimized incident-search
        // iterate over all movers. Send each one instantly to it's next incident
        // for (let i=0; i < this.movers.length; i++) {
        //     this.movers[i].updateSearch(this.incident);
        // }

        for (let i=0; i < this.movers.length; i++) {
            this.movers[i].updateWalk();
            this.movers[i].updateRepair(this.incidents);
        }

        // update incident
        if (this.time.now - this.lastSpawnTime >= 500) {
            if (this.autoSpawn) {
                this.incidents.createRandomIncident(this.tileSize);
                this.lastSpawnTime = this.time.now;
            }
        }

        this.informationBoard.updateMoverStatusText(this.movers, this.incidents);
        
    }

    autoFitMapToScreen() {
        const mapWidthInTiles = this.basemap.getWidth();
        const screenWidth = window.innerWidth;
    
        // Compute the largest tile size that fits within the screen width
        this.tileSize = Math.floor(screenWidth / mapWidthInTiles);
    
        // Redraw and resize everything
        this.basemap.drawMap(this, this.tileSize);
        this.resizeCanvas();
        this.movers.forEach(m => {
            m.changeTileSize(this.tileSize);
        });
        this.incidents.changeTileSize(this.tileSize);
    }

    /**
     * Load the control elements from the HTML page.
     */
    loadControlElements() {
        document.getElementById('speedInput').addEventListener('input', (event) => {
            const newSpeed = parseInt(event.target.value, 10);
            if (!isNaN(newSpeed)) {
                // Update all movers speed
                this.movers.forEach(mover => {
                    mover.MILLISECONDS_PER_METER = newSpeed;
                });
                console.log(`Set new speed to ${newSpeed} ms/meter for all movers.`);
            }
        });

        // Standard walking speed button listener
        document.getElementById('buttonSetStandardSpeed').addEventListener('click', () => {
            const standardSpeed = 700;
            const speedInput = document.getElementById('speedInput');
            speedInput.value = standardSpeed; // Set input value
            this.movers.forEach(mover => {
                mover.MILLISECONDS_PER_METER = standardSpeed;
            });
            console.log(`Reset speed to standard ${standardSpeed} ms/meter for all movers.`);
        });

        document.getElementById('speedRepair').addEventListener('input', (event) => {
            const newRepair = parseInt(event.target.value, 10);
            if (!isNaN(newRepair)) {
                // Update all movers speed
                this.movers.forEach(mover => {
                    mover.MILLISECONDS_PER_REPAIR = newRepair;
                });
                console.log(`Set new repair-speed to ${newRepair} ms per incident.`);
            }
        });
        
        // Standard repair-speed button listener
        document.getElementById('buttonSetStandardRepairSpeed').addEventListener('click', () => {
            const standardSpeed = 2000;
            const speedRepair = document.getElementById('speedRepair');
            speedRepair.value = standardSpeed; // Set input value
            this.movers.forEach(mover => {
                mover.MILLISECONDS_PER_REPAIR = standardSpeed;
            });
            console.log(`Reset repair-speed to standard ${standardSpeed} ms per incident.`);
        });

        // Set up event listeners for the controls
        document.getElementById('autoSpawn').addEventListener('change', (event) => {
            this.autoSpawn = event.target.checked;
        });
        // document.getElementById('speedSlider').addEventListener('input', (event) => {
        //     this.speed = event.target.value;

        // });
        document.getElementById('buttonStopSimulation').addEventListener('click', (event) => {            
            this.controlRun = !this.controlRun;
            event.target.textContent = this.controlRun ? '⏸️ Pause' : '▶️ Play';
        });
        document.getElementById('buttonResetMill').addEventListener('click', (event) => {
            const confirmed = confirm("Resetting the Mill will remove all Movers and Incidents. Are you sure?");
    
            if (confirmed) {
                console.log("User confirmed: Resetting Mill...");
                this.reInit(this.currentFloorplan);

                // // Call your reset function here
                // // Clear Movers
                // this.movers.forEach(mover => {
                //     mover.destroy(); // Remove graphics from scene
                // });
                // this.movers = [];

                // // Clear Incidents
                // this.incidents.clearAll(); // We'll implement this below
            } else {
                console.log("User cancelled.");
            }

        });
        document.getElementById('buttonResetDatabase').addEventListener('click', (event) => {
            const confirmed = confirm("Resetting The Database will truncate the whole Database. Are you sure?");
    
            if (confirmed) {
                console.log("User confirmed: Resetting Mill...");
                fetch('https://millverse-datahub.localhost/postgres/table-truncate?table=incidents', {
                    method: 'GET',
                    headers: {
                        'Accept': '*/*'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text(); // or response.json() if you expect JSON
                })
                .then(data => {
                    console.log("Database reset response:", data);
                })
                .catch(error => {
                    console.error("Error resetting database:", error);
                });
            } else {
                console.log("User cancelled.");
            }
        });
        document.getElementById('buttonIncreaseTileSize').addEventListener('click', (event) => {
            this.tileSize += 1;
            this.basemap.drawMap(this, this.tileSize);
            this.resizeCanvas();
            this.movers.forEach(m => {
                m.changeTileSize(this.tileSize);
            });
            this.incidents.changeTileSize(this.tileSize);
            //this.reInit(this.currentFloorplan);
        });
        document.getElementById('buttonDecreaseTileSize').addEventListener('click', (event) => {            
            this.tileSize -= 1;
            this.basemap.drawMap(this, this.tileSize);
            this.resizeCanvas();
            this.movers.forEach(m => {
                m.changeTileSize(this.tileSize);
            });
            this.incidents.changeTileSize(this.tileSize);
            //this.reInit(this.currentFloorplan);
        });
        document.getElementById('buttonTileSizeAutoFit').addEventListener('click', (event) => {            
            this.autoFitMapToScreen();
        });
        document.getElementById('buttonSpawnWalker1').addEventListener('click', (event) => {            
            this.addMovers(1);
        });
        document.getElementById('buttonSpawnWalker5').addEventListener('click', (event) => {            
            this.addMovers(5);
        });
        document.getElementById('buttonSpawn1').addEventListener('click', (event) => {
            this.incidents.createRandomIncident();
        });
        document.getElementById('buttonSpawn10').addEventListener('click', (event) => {
            for (let i = 0; i < 10; i++) {
                this.incidents.createRandomIncident();
            }
        });
        document.getElementById('buttonSpawn100').addEventListener('click', (event) => {
            for (let i = 0; i < 100; i++) {
                this.incidents.createRandomIncident();
            }
        });
        document.getElementById('selectFloorplan').addEventListener('change', (event) => {
            const selectedValue = event.target.value;
            this.currentFloorplan = selectedValue;
            this.reInit(this.currentFloorplan);
            this.autoFitMapToScreen();
        });
    }    

}
