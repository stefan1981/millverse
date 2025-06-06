import Astar from './Astar.js';
import AstarNode from './AstarNode.js';

export default class Astar2DAlgorithmn {

    constructor(end, start, basemap) {
        return new Astar(
            new AstarNode(end, end, end),
            new AstarNode(start, start, end)
        ).getPathArray(basemap);
    }
}




