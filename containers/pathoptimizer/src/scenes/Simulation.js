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
        this.controlA = true;

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

        this.basemap = new BaseMap(floorPlan);
        //this.tileSize = this.basemap.getTileSize();
        this.basemap.drawMap(this, this.tileSize);

        this.resizeCanvas();


        this.movers = [];
        this.addMovers(4);
        this.incidents = new Incident(this, this.basemap.getMap(), this.tileSize);
        // console.log(`loaded floorplan: ${floorPlan}`);
        // console.log(`mapWidth: ${this.basemap.getWidth()} mapHeight: ${this.basemap.getHeight()}`);
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
            if (this.controlA) {
                this.incidents.createRandomIncident(this.tileSize);
                this.lastSpawnTime = this.time.now;
            }
        }

        this.informationBoard.updateMoverStatusText(this.movers, this.incidents);
        
    }

    autoFitMapToScreen() {
        const mapWidthInTiles = this.basemap.getWidth();
        const screenWidth = window.innerWidth;

        console.log(screenWidth, mapWidthInTiles);
    
        // Compute the largest tile size that fits within the screen width
        this.tileSize = Math.floor(screenWidth / mapWidthInTiles);

        console.log(this.tileSize);
    
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
        // Set up event listeners for the controls
        document.getElementById('controlA').addEventListener('change', (event) => {
            this.controlA = event.target.checked;
        });
        // document.getElementById('speedSlider').addEventListener('input', (event) => {
        //     this.speed = event.target.value;

        // });
        document.getElementById('buttonStopSimulation').addEventListener('click', (event) => {            
            this.controlRun = !this.controlRun;
            event.target.textContent = this.controlRun ? '⏸️ Pause' : '▶️ Play';
        });
        document.getElementById('buttonIncreaseTileSize').addEventListener('click', (event) => {
            console.log("increase tile size");
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
            console.log('Selected value:', selectedValue);
            this.currentFloorplan = selectedValue;
            this.reInit(this.currentFloorplan);
            this.autoFitMapToScreen();
        });
    }    

}
