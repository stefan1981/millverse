import AstarNode from './AstarNode.js';

export default class Astar {

    constructor(startNode, endNode) {
        this.open = [];
        this.close = [];
        this.start = startNode;
        this.end = endNode;
        this.arrFinal = [];
        this.calcSteps = 0;        
    }

    /**
     * Performs the astar algorithm.
     * 
     * @param {*} map 
     * @returns 
     */
    astar (map) {
        this.open.push(this.start);

        // while the optimal solution is found or there is no solution
        do {
            // get node with smallest F value
            var currNode = this.open.sort(this.compare)[0];

            // remove currNode from open-list
            this.open = this.removeNode(this.open, currNode);

            // if currNode is targetNode, the goal is reached
            if (currNode.n == this.end.n) {
                this.close.push(currNode);
                return 'found';
            }

            //
            if (!this.exist(this.close, currNode.n)) {
                this.close.push(currNode);
            }

            // process neighbour Nodes
            this.expand(currNode, map);

        } while (this.open.length > 0);
        return 'not found';
    }

    /**
     * Expand the current node and add the neighbours to the open list.
     * 
     * @param {*} currNode 
     * @param {*} map 
     */
    expand(currNode, map) {
        var neighbours = map.getNeighboursArr(currNode.coord);
        for (var i=0; i<neighbours.length; i++){
            var name = neighbours[i].getX() + '-' + neighbours[i].getY();
            
            //console.log(`Ǹ: ${neighbours[i]} ${currNode.coord} ${this.end.coord} ${currNode.G}`);
            
            var succ = new AstarNode(neighbours[i], currNode.coord, this.end.coord, currNode.G);

            this.calcSteps++;
            // if exist in closelist continue
            if (this.exist(this.close, name)) {
                continue;
            }

            // new way cost = prev.g + 1
            var tentative_g = currNode.G + 1;

            if(this.exist(this.open, name) && tentative_g >= succ.G) {
                continue;
            }

            succ.prev = currNode.coord;
            succ.G = tentative_g;

            var f = tentative_g + succ.H;
            succ.F = f;

            if (this.exist(this.open, succ.n)) {
                this.open = this.setF(this.open, succ.n, f);
            } else {
                this.open.push(succ);
            }
        }
    }

    /**
     * 
     * @param {*} arr 
     * @param {*} name 
     * @param {*} f 
     * @returns 
     */
    setF(arr, name, f) {
        for (var i=0; i<arr.length; i++) {
            if (arr[i].n == name) {
                arr[i].F = f;
            }
        }
        return arr;
    }

    /**
     * Check if a node with a certain name exists in the list.
     * 
     * @param {*} arr 
     * @param {*} name 
     *  @returns boolean
     */
    exist(arr, name) {
        for (var i=0; i<arr.length; i++) {
            if (arr[i].n == name) {
                return true;
            }
        }
        return false;
    }


    /**
     * Remove a node from the list.
     * 
     * @param {*} arr 
     * @param {*} node 
     * @returns 
     */
    removeNode (arr, node) {
        // remove current node from openList
        for (var i=0; i<arr.length; i++) {
            if (arr[i].n == node.n) {
                arr.splice(i, 1);          
            }
        }
        return arr;
    }

    /**
     * Compare two nodes by their F value.
     * 
     * @param {*} a 
     * @param {*} b 
     * @returns 
     */
    compare(a,b) {
        if (a.F <= b.F) {
            return -1;
        }
        if (a.F > b.F) {
            return 1;
        }
    }

    /**
     * Get an array with the path from start to end
     * 
     * @param {*} map 
     * @returns 
     */
    getPathArray(map) {
      this.astar(map);
      this.fillList(this.end, this.start);      
      return this.arrFinal;
    }

    /**
     * Get a node by its name.
     * 
     * @param {*} arr 
     * @param {*} name 
     * @returns 
     */
    getByName(arr, name) {
        for (var i=0; i<arr.length; i++) {
            if (arr[i].n == name) {
                return arr[i];
            }
        }
    }

    /**
     * Fill the list with the path from start to end
     * 
     * @param {*} endNode 
     * @param {*} startNode 
     * @returns 
     */
    fillList(endNode, startNode) {
        for (var i=0; i<this.close.length; i++) {
            if (this.close[i].n == endNode.n) {
                var node =this.getByName(this.close, endNode.n);
                this.arrFinal.push(node);

                var namePrev = node.prev.getX() + '-' + node.prev.getY();
                var nodePrev =this.getByName(this.close, namePrev);

                // endNode == startNode
                if (endNode.n == startNode.n) {
                    return 0;
                }
                this.fillList(nodePrev, startNode);
            }
        }
    }
}




