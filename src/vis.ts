/// <reference path='phys.ts'/>
/// <reference path='chem.ts'/>
/// <reference path='color/colormodels.ts'/>




function phys<S extends Substance | System>(s: S, pos?: [num,num,num], size?:[num,num,num],): S {
    if(!s.physhook) {
        if (s instanceof System) {
            s.physhook = new PhysicsHook(pos, size);

            for(let subs of s.substances) {
                phys(subs);
            }


        } else if (s instanceof Substance) {
            s.physhook = new PhysicsHook(pos, size);
        } else {
            throw "Somehow passed arg was neither substance nor system? "+ s;
        }
    }
    return s;
}

class Drawer {
    draw(ctx: CanvasRenderingContext2D, s: Substance | System) {
        if(s instanceof System) {
            s = s as System;
            
            for(let sub of s.substances) {
                this.draw(ctx, sub);
            }


            for (let subsys of s.subsystems) {
                this.draw(ctx, subsys);
            }
            ctx.beginPath();
            ctx.stroke();
            ctx.fillStyle = "#FFFFFFFF"
            if (!s.physhook) s = phys(s);
            ctx.fillRect(s.physhook.loc[0], s.physhook.loc[1], s.physhook.xsize, s.physhook.ysize);
            
            
// the order kinda matters but I'll leave that up to custom drawers

            return;
        } else if (s instanceof Substance) {
            if (s instanceof AqueousSubstance) {
                ctx.beginPath();
                ctx.stroke();
                // ctx.fillStyle = "#" + s.color().join("");
                ctx.fillStyle = s.rgb();
                if(!s.physhook) s = phys(s);
                if(!s.physhook) throw "broke";
                ctx.fillRect(s.physhook.loc.pos()[0], s.physhook.loc.pos()[1], s.physhook.xsize, s.physhook.ysize);
                return;
            }
        }

    }
}


const glob = new System();
phys(glob);

function tang<S extends Substance | System>(s: S, addToGlobal=true, pos?: [num, num, num], size?: [num, num, num],): S {
    let ret = phys(s);
    if(addToGlobal) {
        if (ret instanceof System) {
            glob.subsystems.push(ret);
        } else if (ret instanceof Substance) {
            glob.substances.push(ret);
        } else throw "s " + ret + "not instanceof System nor Substance!";
    }
    return ret;
}

var drawer = new Drawer(); // the principal drawer
function redraw(t?: num) {
    let canvas = document.getElementById("canvas");
    if(canvas && canvas instanceof HTMLCanvasElement) {
        let ctxt = canvas.getContext("2d");
        if(ctxt === null) throw "Context is null?";
        drawer.draw(ctxt, glob);
    } else {
        throw "Canvas doesn't exist?";
    }
}

function _componentToHex(c: number) {
    var hex = Math.round(Math.min(c, 255)).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function _hex(r: num, g: num, b: num, ...extras: num[]) {
    return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
}


