import React from 'react';
import Sketch from "react-p5";
import './App.css';
import p5 from "p5";

class Node {
    pos: p5.Vector
    color: string
    radius: number
    neighbours: Set<Node>
    name: string
    pInst: p5

    constructor(p5: p5, x: number, y: number, color: string, radius: number, name: string) {
        this.pInst = p5
        this.pos = p5.createVector(x, y)
        this.color = color
        this.radius = radius
        this.neighbours = new Set()
        this.name = name
    }

    connect(n: Node) {
        if (n !== this && !this.isConnected(n)) {
            this.neighbours.add(n)
            n.connect(this)
        }
    }

    disconnect(n: Node) {
        this.neighbours.delete(n)
    }

    disconnectAll() {
        this.neighbours.clear()
    }

    isConnected(n: Node): boolean {
        return this.neighbours.has(n)
    }

    render() {
        this.pInst.fill(this.color)
        this.pInst.ellipse(this.pos.x, this.pos.y, this.radius, this.radius)
        this.neighbours.forEach(n => {
            this.pInst.stroke(126);
            this.pInst.strokeWeight(2);
            this.pInst.line(this.pos.x, this.pos.y, n.pos.x, n.pos.y)
            this.pInst.strokeWeight(0);
        })
    }
}

function App() {
    const distance = 100;
    const nodes: Array<Node> = []
    const numNodes = 20
    let nodeSelected: Node | null = null
    let mouseVec: p5.Vector | any = null

    let setup = (p: p5, canvasParentRef: Element) => {
        mouseVec = p.createVector()
        let xyz = p.createCanvas(2000, 2000).parent(canvasParentRef);
        let x = (p.windowWidth - p.width) / 2;
        let y = (p.windowHeight - p.height) / 2;
        for (let i = 0; i < numNodes; ++i) {
            nodes.push(new Node(p, 1000, 1000, "rgb(100%,0%,0%)", 10 + p.random(40), ''))
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

    let draw = (p: p5) => {
        p.background("rgb(0%,0%,0%)");

        for (let it = 0; it < 5; ++it) {
            for (let i = 0; i < nodes.length; ++i) {
                let n = nodes[i]
                let vRepel = p.createVector()
                let isRepelled = false
                let vAttract = p.createVector()
                for (let j = 0; j < nodes.length; ++j) {
                    if (i === j) {
                        continue
                    }

                    const nn = nodes[j]
                    const curDist = n.pos.dist(nn.pos)
                    if ((n.isConnected(nn))) {
                        if (curDist < 0.2 * distance) {
                            vAttract.x -= nn.pos.x - n.pos.x
                            vAttract.y -= nn.pos.y - n.pos.y
                        } else if (curDist > 1.0 * distance) {
                            vAttract.x += nn.pos.x - n.pos.x
                            vAttract.y += nn.pos.y - n.pos.y
                        }
                    } else if (n.pos.dist(nn.pos) < 1.0 * distance) {
                        isRepelled = true
                        vRepel.x -= nn.pos.x - n.pos.x
                        vRepel.y -= nn.pos.y - n.pos.y
                    }
                }
                vRepel.normalize().mult(1 + n.neighbours.size)
                vAttract.normalize()

                if (vRepel.x === 0 && vRepel.y === 0 && isRepelled) {
                    n.pos.x += p.random(-10, 10)
                    n.pos.y += p.random(-10, 10)
                }

                n.pos.add(vRepel)
                if (vRepel.x === 0 && vRepel.y === 0) {
                    n.pos.add(vAttract)
                }
            }
        }

        nodes.forEach((n: Node) => {
            n.render()
        })

    };
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
