import p5 from "p5"

type Vector = p5.Vector

export interface Node {
    id: number
    pos: Vector
    edges: Set<Node>
    weight: number
}

export function stepDelta(xi: Node, xj: Node, idealDistance: number, weight?: number, step?: number) {
    if (weight === undefined) {
        weight = 1
    }
    if (step === undefined) {
        step = 1
    }
    const d = xi.pos.dist(xj.pos)
    // console.log('d:', d)
    const m = (d - idealDistance) * d / 2
    // console.log('m:', m)
    const r = xi.pos.copy().sub(xj.pos).mult(m)
    // console.log('r:', r)
    const f = r.mult(4 * weight * step)
    // console.log('f.mag():', f.mag())
    xi.pos.sub(f)
    xj.pos.add(f)
    let count = 100
    while (xi.pos.dist(xj.pos) < idealDistance / 2 && --count > 0) {
        xi.pos.sub(f)
        xj.pos.add(f)
    }
}

export function stress(g: Array<Node>, idealDistance: number): number {
    let s = 0

    let visited = new Set()
    for (let i = 0; i < g.length; ++i) {
        const g1 = g[i]
        for (let j = 0; j < g.length; ++j) {
            if (i === j) continue
            const g2 = g[j]
            const k = `${g1.id}.${g2.id}`
            if (!visited.has(k)) {
                visited.add(k)
                const d = g1.pos.dist(g2.pos)
                s += (d - idealDistance) * (d - idealDistance)
            }
        }
    }
    return s
}

export function procIterate(g: Array<Node>, idealDistance: number, weight: number, stepSize: number, p: p5) {
    let l = []
    for (let i = 0; i < g.length; ++i) {
        l.push(i)
    }
    p.shuffle(l, true)
    const l2 = p.shuffle(l)

    let s = 0
    let visited = new Set()
    for (let i = 0; i < g.length; ++i) {
        const g1 = g[l[i]]
        // const g1 = g[i]
        for (let j = 0; j < g.length; ++j) {
            if (i === j) continue
            const g2 = g[l2[j]]
            // const g2 = g[j]
            // let dist = g1.edges.has(g2)? idealDistance: 2 * idealDistance
            let dist = idealDistance
            const k = `${g1.id}.${g2.id}`
            if (visited.has(k)) {
                continue
            }
            visited.add(k)
            const d = g1.pos.dist(g2.pos)
            if (!g1.edges.has(g2) && d > idealDistance) continue
            s += (d - dist) * (d - dist)
            stepDelta(g1, g2, dist, weight, stepSize)
        }
    }
    return s
}
