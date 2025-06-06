export default class InformationBoard {
    constructor() {

        this.speed = 500;        
    }


    /**
     * Load the table for the Movers
     */
    loadMoverTable() {
        setTimeout(() => {
            this.dataTablePiecer = $('#moverStatus').DataTable({
                paging: false,     // no pagination
                info: false,       // hide "Showing x of y"
                searching: false,   // enable filtering
                ordering: true,    // enable sorting
                columns: [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ]
            });
        }, 100); // delay init to make sure DOM is ready
    }

    /**
     * Load the incident table
     */
    loadIncidentTable() {
        setTimeout(() => {
            this.dataTableIncident = $('#incidentStatus').DataTable({
                paging: false,     // no pagination
                info: false,       // hide "Showing x of y"
                searching: false,   // enable filtering
                ordering: true,    // enable sorting
                columns: [
                    null,
                    null,
                    null,
                    null
                ]
            });
        }, 100); // delay init to make sure DOM is ready
    }

    /**
     * Update the mover status text
     * @param {*} movers
     * @param {*} incident
    */
    updateMoverStatusText(movers, incident) {
        if (!this.dataTablePiecer) return;
        if (!this.dataTableIncident) return;

        // Clear and re-add rows
        this.dataTablePiecer.clear();
        movers.forEach((mover, index) => {
            let color = "#" + mover.pathColor.toString(16).padStart(6, "0");
            const rowData = [
                (index + 1),
                `<span style="background-color: ${color};">&nbsp;</span> ${this.getStatus(mover.status)}=${mover.status}`,
                
                mover.statSteps,
                mover.statPieces,
                Math.round(mover.statSteps / mover.statPieces, 1),
                `${mover.curr.getX()}/${mover.curr.getY()}`,
                `S:${mover.start.getX()}/${mover.start.getY()} E:${mover.end.getX()}/${mover.end.getY()}`
            ];
            this.dataTablePiecer.row.add(rowData);
        });
        this.dataTablePiecer.draw();

        // Clear and re-add rows
        this.dataTableIncident.clear();

        incident.getIncidents().forEach((incident, index) => {
            const rowData = [
                index + 1,
                `${incident.id}`,
                `${incident.x}, ${incident.y}`,
                incident?.lock ? 'locked' : 'unlocked'
            ];
            this.dataTableIncident.row.add(rowData);
        });
        this.dataTableIncident.draw();
    }

    /**
     * Map the status to a symbol
     * 
     * @param {*} status 
     * @returns 
     */
    getStatus(status) {
        if (status == 0) { return '⏳'; }
        if (status == 1) { return '👣'; }
        if (status == 2) { return '🛠️'; }
        if (status == 3) { return '🛠️'; }
    }    

}
