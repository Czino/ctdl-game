import { contains, intersects, touches } from '../src/geometryUtils'
import { ok } from 'assert'
const obj1 = { x: 10, y: 10, w: 10, h: 10 }
const obj2 = { x: 19, y: 30, w: 10, h: 10 }
const obj3 = { x: 14, y: 14, w: 2, h: 2 }
const obj4 = { x: 14, y: 14, w: 10, h: 10 }
const obj5 = { x: 40, y: 40, w: 10, h: 10 }
const obj6 = { x: 19, y: 10, w: 10, h: 10 }
const obj7 = { x: 19, y: 10, w: 10, h: 10 }
const obj8 = { x: 20, y: 10, w: 10, h: 10 }

const boundary = {x: 0, y: 192, w: 32, h: 64}
const ground = {x: 0, y: 252, w: 128, h: 5}

describe('contains', () => {
  it('should correctly tell if two objects intersect', () => {
    ok(contains(obj1, obj3), 'Object totally inside object')
    ok(contains(obj1, obj4), 'Object overlapping object')
    ok(!contains(obj1, obj2), 'Object outside object')
    ok(!contains(obj1, obj5), 'Object outside object')
  })
})

describe('intersects', () => {
  it('should correctly tell if two objects intersect', () => {
    ok(intersects(obj1, obj1), 'Two objects completely overlapping')
    ok(intersects(obj1, obj6), 'Two objects intersecting by 1 px')
    ok(intersects(boundary, ground), 'Case boundary should intersect with ground')
    ok(!intersects(obj1, obj2), 'Object outside object')
    ok(!intersects(obj1, obj5), 'Object outside object')
  })
})

describe('touches', () => {
  it('should correctly tell if two objects touch', () => {
    ok(!touches(obj1, obj7), 'Two objects intersecting by 1 px')
    ok(touches(obj1, obj8), 'Two objects sitting side by side')
  })
})