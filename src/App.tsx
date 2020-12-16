import React from 'react';
import Sketch from "react-p5";
import './App.css';
import p5 from "p5";

import {stress, Node, procIterate} from "./graph/layout";

class NodeImp implements Node {
    static idCounter = 0
    id: number
    pos: p5.Vector
    edges: Set<NodeImp>
    weight: number

    color: string
    radius: number
    name: string
    pInst: p5

    constructor(p5: p5, x: number, y: number, color: string, radius: number, name: string) {
        this.id = NodeImp.idCounter++
        this.pos = p5.createVector(x, y)
        this.weight = 1
        this.pInst = p5
        this.color = color
        this.radius = radius
        this.edges = new Set()
        this.name = name
    }

    connect(n: NodeImp) {
        if (n !== this && !this.isConnected(n)) {
            this.edges.add(n)
            n.connect(this)
        }
    }

    disconnect(n: NodeImp) {
        this.edges.delete(n)
    }

    disconnectAll() {
        this.edges.clear()
    }

    isConnected(n: NodeImp): boolean {
        return this.edges.has(n)
    }

    render() {
        this.pInst.fill(this.color)
        this.pInst.ellipse(this.pos.x, this.pos.y, this.radius, this.radius)
        this.edges.forEach(n => {
            this.pInst.stroke(126);
            this.pInst.strokeWeight(2);
            this.pInst.line(this.pos.x, this.pos.y, n.pos.x, n.pos.y)
            this.pInst.strokeWeight(0);
        })
    }
}

const H = 1000
const W = 1000
const idealDistance = 100

function App() {
    const nodes: Array<NodeImp> = []
    const numNodes = 20
    let stressVal = 0
    let nodeSelected: NodeImp | null = null
    let mouseVec: p5.Vector | any = null
    let deltaTime = 0
    let doneOnce = false

    let setup = (p: p5, canvasParentRef: Element) => {
        mouseVec = p.createVector()
        let xyz = p.createCanvas(W, H).parent(canvasParentRef);
        let x = (p.windowWidth - p.width) / 2;
        let y = (p.windowHeight - p.height) / 2;
        for (let i = 0; i < numNodes; ++i) {
            nodes.push(new NodeImp(p, W / 2 + p.random(-50, 50), H / 2 + p.random(-50, 50), "rgb(100%,0%,0%)", 10 + p.random(40), ''))
        }

        for (let i = 0; i < numNodes; ++i) {
            let random = i
            while (random === i) {
                random = p.round(p.random(0, numNodes - 1))
            }
            nodes[i].connect(nodes[random])
        }
        xyz.position(x, y);
    };

    let mousePressed = (p: p5) => {
        if (!p || mouseVec === null) {
            return false
        }
        mouseVec.x = p.mouseX
        mouseVec.y = p.mouseY
        for (let i = 0; i < numNodes; ++i) {
            const n = nodes[i]
            if (n.pos.dist(mouseVec) < n.radius) {
                nodeSelected = n
                return false
            }
        }
        return false
    }

    let mouseReleased = (p: p5) => {
        nodeSelected = null
        return false
    }

    let mouseDragged = (p: p5) => {
        if (nodeSelected) {
            nodeSelected.pos.x = p.mouseX
            nodeSelected.pos.y = p.mouseY
        }
        return false
    }

    let physics = (p: p5) => {
        // stressVal = stress(nodes, idealDistance)
        // deltaTime += p.deltaTime
        // if (deltaTime < 1000) {
        //     return
        // }
        // deltaTime = 0
        stressVal = stress(nodes, idealDistance)
        procIterate(nodes, idealDistance, 0.0002, 0.01, p)
    }

    // let draw = (p: p5) => {
    //     p.background("rgb(0%,0%,0%)")
    //
    //     let maxCons = 0
    //     nodes.forEach(n => maxCons = p.max(n.neighbours.size, maxCons))
    //
    //     let atleastOneRepel = false
    //     for (let it = 0; it < 5; ++it) {
    //         for (let i = 0; i < nodes.length; ++i) {
    //             let n = nodes[i]
    //             let vRepel = p.createVector()
    //             let isRepelled = false
    //             for (let j = 0; j < nodes.length; ++j) {
    //                 if (i === j) {
    //                     continue
    //                 }
    //
    //                 const nn = nodes[j]
    //                 const curDist = n.pos.dist(nn.pos)
    //                 if (curDist< distance) {
    //                     isRepelled = true
    //                     atleastOneRepel = true
    //                     vRepel.x -= nn.pos.x - n.pos.x
    //                     vRepel.y -= nn.pos.y - n.pos.y
    //                 }
    //             }
    //             // vRepel.normalize().mult(1 + n.neighbours.size)
    //             // if (maxCons > 0) {
    //             //     vRepel.normalize().mult(5 * (1 - n.neighbours.size / maxCons))
    //             // } else {
    //             //
    //             // }
    //             if (vRepel.x === 0 && vRepel.y === 0 && isRepelled) {
    //                 n.pos.x += p.random(-1, 1)
    //                 n.pos.y += p.random(-1, 1)
    //             }
    //             n.pos.add(vRepel)
    //         }
    //     }
    //
    //     if (!atleastOneRepel) {
    //         for (let it = 0; it < 5; ++it) {
    //             for (let i = 0; i < nodes.length; ++i) {
    //                 let n = nodes[i]
    //                 let vAttract = p.createVector()
    //                 for (let j = 0; j < nodes.length; ++j) {
    //                     if (i === j) {
    //                         continue
    //                     }
    //
    //                     const nn = nodes[j]
    //                     const curDist = n.pos.dist(nn.pos)
    //                     if ((n.isConnected(nn))) {
    //                         if (curDist < 0.2 * distance) {
    //                             vAttract.x -= nn.pos.x - n.pos.x
    //                             vAttract.y -= nn.pos.y - n.pos.y
    //                         } else if (curDist > 1.25 * distance) {
    //                             vAttract.x += nn.pos.x - n.pos.x
    //                             vAttract.y += nn.pos.y - n.pos.y
    //                         }
    //                     }
    //                 }
    //                 vAttract.normalize()
    //                 n.pos.add(vAttract)
    //                 n.pos.x = p.min(n.pos.x, W)
    //                 n.pos.x = p.max(n.pos.x, 0)
    //                 n.pos.y = p.min(n.pos.y, H)
    //                 n.pos.y = p.max(n.pos.y, 0)
    //             }
    //         }
    //     }
    //
    //     nodes.forEach((n: Node) => {
    //         n.render()
    //     })
    // }

     let draw = (p: p5) => {
        // if (!doneOnce) {
        //     doneOnce = true
            physics(p)
        // }

        p.background("rgb(0%,0%,0%)")
        p.text(`${stressVal}`, 50, 50)

        // let maxCons = 0
        // nodes.forEach(n => maxCons = p.max(n.edges.size, maxCons))


        nodes.forEach((n: NodeImp) => {
            n.render()
        })

        // p.stroke(200);
        // p.strokeWeight(1);
        // p.noFill()
        // nodes.forEach(n => {
        //     p.ellipse(n.pos.x, n.pos.y, idealDistance, idealDistance)
        //  })
    }

    return (
        <div className="App">
            <Sketch
                setup={setup}
                draw={draw}
                mouseDragged={mouseDragged}
                mousePressed={mousePressed}
                mouseReleased={mouseReleased}
                className="App"/>
        </div>
    );
}

export default App;
