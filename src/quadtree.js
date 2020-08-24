import { contains, intersects } from './geometryUtils'

export const Boundary = function ({ x, y, w, h }) {
  this.x = x
  this.y = y
  this.w = w
  this.h = h
}

export const QuadTree = function (boundary, capacity) {
  this.boundary = boundary,
  this.capacity =  capacity || 10,
  this.subs = [],
  this.objects = []

  this.insert = object => {
    if (object.getBoundingBox) {
      const boundingBox = object.getBoundingBox()
      object = {
        ...object,
        ...boundingBox
      }
    }
    if (!intersects(this.boundary, object)) {
      return false
    }

    if (this.subs.length === 0 && this.objects.length < this.capacity) {
      this.objects.push(object)
      return true
    }

    if (this.subs.length === 0) {
      this.subdivide()

      // redistribute objects in newly created subs
      this.objects.forEach(o => {
        this.subs.forEach(sub => {
          return sub.insert(o)
        })
      })
      this.objects = []
    }

    return this.subs.forEach(sub => {
      return sub.insert(object)
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

    range = new Boundary(range)
    if (!intersects(this.boundary, range)) {
      return result
    }

    result = this.objects

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
    context.lineWidth = 1
    context.strokeRect(this.boundary.x - .5, this.boundary.y - .5, this.boundary.w, this.boundary.h)
    this.subs.forEach(sub => sub.show(context))
    this.objects.forEach(object => {
      context.strokeRect(object.x - .5, object.y - .5, object.w, object.h)
    })
  }
  this.clear = () => {
    this.objects = []
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