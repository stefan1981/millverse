export default class AstarNode {
    constructor(start, prev, end, travelled) {
        // the nodes name
        this.n = '' + start.getX() + '-' +start.getY() + '';

        this.H = this.getDistance(start, end);  // heuristic distance to target

        // already travelled way (zero if the node is the startnode)
        this.G = '';
        if (start.getX() == prev.getX() && start.getY() == prev.getY()) {
            this.G = 0;
        } else {
            this.G = travelled +1;              //this.getDistance(start, prev);
        }

        this.F = this.H + this.G;               // travelled way + optimal distance to target
        this.coord = start;                     // coordinates of current node
        this.prev = prev;                       // coordinates of previous node
    }

    /**
     * Get the Distance between two nodes
     * 
     * @param {*} a 
     * @param {*} b 
     * @returns number
     */
    getDistance(a, b) {
        return Math.abs(a.getX() - b.getX()) + Math.abs(a.getY() - b.getY());
    }
}

