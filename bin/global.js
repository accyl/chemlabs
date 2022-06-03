"use strict";
let canvas = document.getElementById('canvas');
class Global extends SubstGroup {
    constructor() {
        super(...arguments);
        this.solids_i = 0;
        this.gases_i = 0;
        this.liquids_i = 0;
    }
    addSubst(s) {
        if (s.state === 'g') {
            this.substances.splice(this.gases_i, 0, s); // insert at index of gases_idx
            this.gases_i++;
            this.liquids_i++;
            this.solids_i++;
        }
        else if (s.state === 'l') {
            this.substances.splice(this.liquids_i, 0, s); // insert at index
            this.liquids_i++;
            this.solids_i++;
        }
        else if (s.state === 'l') {
            this.substances.splice(this.solids_i, 0, s); // insert at index
            this.solids_i++;
        }
        else {
            this.substances.push(s);
        }
    }
}
const glob = new Global();
universe.glob = glob;
phys(glob, [0, 0], [canvas.width, canvas.height]);
let b = newBounds({ x: canvas.width / 4, y: canvas.height / 4 }, { x: canvas.width / 2, y: canvas.height / 2 }); // canvas.width/2, y:canvas.height/2});
