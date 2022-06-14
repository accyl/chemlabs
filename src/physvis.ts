// <reference path='chem.ts'/>
// <reference path='color/colormodels.ts'/>
// <reference path='../raw/tut.matter.js'/>

// import _ from "lodash";



class Drawer {
    drawSubstance(ctx: CanvasRenderingContext2D, s: Substance | SubstGroup) {
        if (s instanceof Substance) {
            // if (s instanceof AqueousSubstance) {
                // ctx.beginPath();
                // ctx.stroke();
                // ctx.fillStyle = "#" + s.color().join("");
                let prevs = ctx.fillStyle;
                // let preva = ctx.globalAlpha;
                ctx.fillStyle = s.hexcolor();
                if(!s.physhook) s = applyPhyshook(s);
                if(!s.physhook) throw new Error("No physhook for substance " + s.toString());
                // ctx.globalAlpha = s.physhook.render.opacity ? s.physhook.render.opacity : 1;
                this.drawBody(ctx, s.physhook, false); //.rect);
                // ctx.fillRect(s.physhook.pos.x, s.physhook.pos.y, s.physhook.size.x, s.physhook.size.y);
                ctx.fillStyle = prevs;
                // ctx.globalAlpha = preva;


                return;
            // }
        } else if (s instanceof SubstGroup) {
            s = s as SubstGroup;

            for (let sub of s.substances) {
                this.drawSubstance(ctx, sub);
            }

            for (let subsys of s.subsystems) {
                this.drawSubstance(ctx, subsys);
            }
            // ctx.beginPath();
            // ctx.stroke();
            // let prevs = ctx.fillStyle;
            // ctx.fillStyle = "#FFFFFFFF";
            // if (!s.physhook) s = phys(s);
            // ctx.fillRect(s.physhook.loc[0], s.physhook.loc[1], s.physhook.xsize, s.physhook.ysize);
            // if (!s.physhook) throw "broke";
            // this.drawB(ctx, s.physhook.rect);
            // ctx.fillStyle = prevs;
            // the order kinda matters but I'll leave that up to custom drawers
            // actually let's not draw Systems
            // Also Systems correspond to Composites extremely closely - reduce objects
            return;
        } else throw "Somehow passed arg was neither substance nor system? " + s;

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
}

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let ctx = canvas.getContext('2d');

class Global extends SubstGroup {
    solids_i=0;
    gases_i=0;
    liquids_i=0;
    addSubst(s: Substance) {
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
            this.substances.push(s);
        // }
    }
}
const glob = new Global();
universe.glob = glob;
applyPhyshook(glob, [0, 0], [canvas.width, canvas.height]);
let b = newBounds({ x: canvas.width / 4, y: canvas.height / 4 }, { x: canvas.width / 2, y: canvas.height / 2 }); // canvas.width/2, y:canvas.height/2});

function tangify<S extends Substance | SubstGroup>(s: S, addToGlobal=true, pos?: [num, num, num], size?: [num, num, num],): S {
    let ret = applyPhyshook(s);


    if(addToGlobal) {
        if (ret instanceof Substance) {
            // glob.substances.push(ret);
            glob.addSubst(ret);
        } else if (ret instanceof SubstGroup) {
            glob.subsystems.push(ret);
        } else throw "s " + ret + "not instanceof System nor Substance!";


    }
    eventDispatch('substanceCreated', { 'substance': s });
    return ret;
}

var drawer = new Drawer(); // the principal drawer

function redraw(t?: num) {

    let ctx = getCanvasContext();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    drawer.drawComposite(ctx, universe.world);
    drawer.drawSubstance(ctx, glob);

}
function updateZIndex() {
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

(function() {
    let func = () => {
        if(!universe.paused) redraw();
        requestAnimationFrame(func);
    }
    // window.requestAnimationFrame(func);
})();


