export default class Point2D {
    constructor(x, y) {
        this.point = {'x':x, 'y':y};
    }

    show(){ console.log('x:' + this.point.x + ' y:' + this.point.y ); }

    getX(){ return this.point.x; }

    getY(){ return this.point.y; }

    setX(x){ this.point.x = x; }

    setY(y){ this.point.y = y; }
}
