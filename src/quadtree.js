export const Boundary = function ({ x, y, w, h }) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.contains = point => {
        return point.x + point.w / 2 >= this.x &&
        point.x + point.w / 2 <= this.x + this.w &&
        point.y + point.h / 2 >= this.y &&
        point.y + point.h / 2 <= this.y + this.h
    }
    this.intersects = range => {
        return !(
            range.x > this.x + this.w ||
            range.x + range.w < this.x ||
            range.y > this.y + this.w ||
            range.y + range.h < this.y
        )
    }
}

export const QuadTree = function (boundary, capacity) {
    this.boundary = boundary,
    this.capacity =  capacity || 10,
    this.subs = [],
    this.points = []

    this.insert = point => {
        if (!this.boundary.contains(point)) {
            return false
        }

        if (this.points.length < this.capacity) {
            this.points.push(point)
            return true
        }

        if (this.subs.length === 0) {
            this.subdivide()

            // redistribute points in newly created subs
            this.points.forEach(p => {
                this.subs.some(sub => {
                    return sub.insert(p)
                })
            })
            this.points = []
        }

        return this.subs.some(sub => {
            return sub.insert(point)
        })
    }
    this.subdivide = () => {
        const subBoundary = {
            w: this.boundary.w / 2,
            h: this.boundary.h / 2
        }
        this.subs = [
            new QuadTree(
                new Boundary({
                    x: this.boundary.x,
                    y: this.boundary.y,
                    w: subBoundary.w,
                    h: subBoundary.h
                }),
                this.capacity
            ),
            new QuadTree(
                new Boundary({
                    x: this.boundary.x + subBoundary.w,
                    y: this.boundary.y,
                    w: subBoundary.w,
                    h: subBoundary.h
                }),
                this.capacity
            ),
            new QuadTree(
                new Boundary({
                    x: this.boundary.x + subBoundary.w,
                    y: this.boundary.y + subBoundary.h,
                    w: subBoundary.w,
                    h: subBoundary.h
                }),
                this.capacity
            ),
            new QuadTree(
                new Boundary({
                    x: this.boundary.x,
                    y: this.boundary.y + subBoundary.h,
                    w: subBoundary.w,
                    h: subBoundary.h
                }),
                this.capacity
            ),
        ]
    }
    this.query = range => {
        let result = []
        if (!this.boundary.contains(range)) {
            return result
        }

        result = this.points

        if (this.subs.length > 0) {
            result = result
                .concat(this.subs.map(sub => sub.query(range)))
                .reduce(flatten, [])
        }

        return result
    }
    this.show = context => {
        context.fillStyle = 'transparent'
        context.strokeStyle = `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`
        context.strokeWidth = 1
        context.strokeRect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h)
        this.subs.forEach(sub => sub.show(context))
        this.points.forEach(point => {
            context.strokeRect(point.x, point.y, point.w, point.h)
        })
    }
    this.clear = () => {
        this.points = []
        this.subs = []
    }
}

function flatten(arr, item) {
    if (Array.isArray(item)) {
        arr = arr.concat(item)
    } else {
        arr.push(item)
    }
    return arr
}
export default QuadTree