// <reference path='chem.ts'/>
// <reference path='color/colormodels.ts'/>
// <reference path='../raw/tut.matter.js'/>

import Matter from "matter-js";
import { applyPhyshook, newBounds } from "./phys";
import { ChemComponent, ChemType } from "./substance";

// import _ from "lodash";


// note: right now NONE of this actually runs, we're using the in-built renderer in matterjsobjects.ts
/*
export class Drawer {

    drawSubstance(ctx: CanvasRenderingContext2D, s: ChemComponent ) {

        if(s.subcomponents) {
            for (let sub of s.subcomponents) {
                this.drawSubstance(ctx, sub);
            }
        } else {
        // if (s instanceof AqueousSubstance) {
            // ctx.beginPath();
            // ctx.stroke();
            // ctx.fillStyle = "#" + s.color().join("");
            let prevs = ctx.fillStyle;
            // let preva = ctx.globalAlpha;
            ctx.fillStyle = s.hexcolor();
            // if(!s.physhook) s = applyPhyshook(s);
            if(!s.physhook) return; // if physhook is not present, there is nothing to do
            // ctx.globalAlpha = s.physhook.render.opacity ? s.physhook.render.opacity : 1;
            this.drawBody(ctx, s.physhook, false); 
            // ctx.fillRect(s.physhook.pos.x, s.physhook.pos.y, s.physhook.size.x, s.physhook.size.y);
            ctx.fillStyle = prevs;
            // ctx.globalAlpha = preva;


            return;
        // }
        }

    }
    
    drawComposite(ctx: CanvasRenderingContext2D, cs: Matter.Composite, formatChildren=true) {
        // ctx.stroke();
        let prev = ctx.strokeStyle;
        ctx.strokeStyle = '#888888';
        let preva = ctx.globalAlpha;
        for(let b of Matter.Composite.allBodies(cs)) {
            if('substs' in b && (b as any)['substs']) continue; // skip all substances to avoid duplicates
            if (b.render.opacity) ctx.globalAlpha = b.render.opacity; 

            this.drawBody(ctx, b, formatChildren);
        }
        ctx.strokeStyle = prev;
        ctx.globalAlpha = preva;
    }
    drawBody(ctx: CanvasRenderingContext2D, b: Matter.Body, format=true) {

        if(b.parts.length > 1) {
            for(let j=1;j<b.parts.length;j++) {
                let part = b.parts[j];
                this.drawBody(ctx, part, format);
            }
            return;
        }
        let prevf: string, preva: number, prevs: string;
        if(format) {
            // fillstyle, opacity, strokestyle according to body.render
            prevf = ctx.fillStyle as string;
            preva = ctx.globalAlpha as number;
            prevs = ctx.strokeStyle as string;
            if (b.render.fillStyle) ctx.fillStyle = b.render.fillStyle;
            if (b.render.opacity) ctx.globalAlpha = b.render.opacity;
            if (b.render.strokeStyle) ctx.strokeStyle = b.render.strokeStyle;
        }
        let vs = b.vertices;
        ctx.beginPath();
        ctx.moveTo(vs[0].x, vs[0].y);
        for (let i = 1; i < vs.length; i++) {
            let v = vs[i];
            ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        if(format) {
            if (prevf!) ctx.fillStyle = prevf;
            if (preva!) ctx.globalAlpha = preva;
            if (prevs!) ctx.strokeStyle = prevs;
        }
    }
}*/

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let ctx = canvas.getContext('2d');

export class ChemGlobal extends ChemComponent {
    solids_i=0;
    gases_i=0;
    liquids_i=0;
    addSubst(s: ChemComponent) {
        // if(s.state === 'g') {
        //     this.substances.splice(this.gases_i, 0, s); // insert at index of gases_idx
        //     this.gases_i++;
        //     this.liquids_i++;
        //     this.solids_i++;
        // } else if(s.state === 'l') {
        //     this.substances.splice(this.liquids_i, 0, s); // insert at index
        //     this.liquids_i++;
        //     this.solids_i++;
        // } else if (s.state === 'l') {
        //     this.substances.splice(this.solids_i, 0, s); // insert at index
        //     this.solids_i++;
        // } else {
            this.subcomponents.push(s);
        // }
    }
    constructor(type?: ChemType) {
        super(type);
        this.physhook = false; // no physhook
    }
}
export const glob = new ChemGlobal();

/**
 * If s is a ChemComponent with no associated PhysicsHook, then
 * this function 
 * 1) gives it a PhysicsHook, and 
 * 2) (if addToGlobal) registers the component with global.
 * @param s 
 * @param addToGlobal 
 * @param pos 
 * @param size 
 * @returns 
 */
export function tangify<S extends ChemComponent >(s: S, addToGlobal=true, pos?: [num, num], size?: [num, num],): S {
    let ret = applyPhyshook(s, pos, size);


    if(addToGlobal) {
        if (ret instanceof ChemComponent) {
            // glob.substances.push(ret);
            glob.addSubst(ret);
        } else throw "s " + ret + "not instanceof System nor Substance!";

    }
    eventDispatch('substanceCreated', { 'substance': s });
    return ret;
}
/*
export var principalDrawer = new Drawer(); // the principal drawer

export function redraw(t?: num) {
    console.log('h');
    let ctx = getCanvasContext();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    principalDrawer.drawComposite(ctx, universe.world);
    // principalDrawer.drawSubstance(ctx, glob);

}*/
export function redraw(t?: num) {
    // does nothing for now, I gutted the rendering
    // mainly affects load.ts transition screens
}
export function updateZIndex() {
    // basically, move gases towards the front of the so they're drawn behind solids
    // TODO: reorder universe.world according to glob
    universe.world.bodies.sort((a, b) => {
        // @ts-ignore
        const zIndexA = typeof a.zIndex !== 'undefined' ? a.zIndex : 0;
        // @ts-ignore
        const zIndexB = typeof b.zIndex !== 'undefined' ? b.zIndex : 0;
        return zIndexA - zIndexB;
    });
    // Matter.Composite.rebase(universe.world);
}

// (function() {
export function physvisMain() {
    universe.glob = glob;

    // applyPhyshook(glob, [0, 0], [canvas.width, canvas.height]);
    for (let subs of glob.subcomponents) {
        applyPhyshook(subs);
    }
    let b = newBounds({ x: canvas.width / 4, y: canvas.height / 4 }, { x: canvas.width / 2, y: canvas.height / 2 }); // canvas.width/2, y:canvas.height/2});

    /*
    let func = () => {
        if(!universe.paused) redraw();
        requestAnimationFrame(func);
    }*/
    // window.requestAnimationFrame(func);
// })();
}

