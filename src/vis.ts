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

function defButton() {
    let sub = KMnO4.form();
    tang(sub);
    redraw();
}

function _componentToHex(c: number) {
    var hex = Math.round(Math.min(c, 255)).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function _hex(r: num, g: num, b: num) {
    return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
}
function slider() {
    let h = document.querySelector("#slider") as any;
    let s = glob.s[0] as AqueousSubstance;
    s.concentration = h.value / 10000000;
    redraw();

    let canvas = document.getElementById("canvas");
    if (canvas && canvas instanceof HTMLCanvasElement) {
        let ctxt = canvas.getContext("2d");
        if (ctxt === null) throw "Context is null?";
        // let m = irgb_from_xyz(xyz_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 1000)));
        // let m = rgb_from_spectrum(f_daylight);

        let m = rgb_from_spectrum(x => transmittance(spectra_kmno4_f(x), h.value / 10));

        ctxt.beginPath();
        ctxt.stroke();
        // console.log(m);
        ctxt.fillStyle = _hex(m[0],m[1],m[2]);
        ctxt.fillRect(0,10,10,10);

        let n = rgb_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value /10));
        ctxt.beginPath();
        ctxt.stroke();
        // console.log(m);
        ctxt.fillStyle = _hex(n[0], n[1], n[2]);
        ctxt.fillRect(0, 20, 10, 10);

        let p = rgb_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x) / 46 / (149 * 10 ^ -6), h.value / 10));
        ctxt.beginPath();
        ctxt.stroke();
        // console.log(m);
        ctxt.fillStyle = _hex(p[0], p[1], p[2]);
        ctxt.fillRect(0, 30, 10, 10);

    }
    
    // rgb_from_xyz(xyz_from_spectrum(x => transmittance(spectra_kmno4_f(x), 1)));
}
function graph(f?: (x: num)=> num, start:num=360, end:num=830) {
    // if(!f) f = f_daylight;
    if (!f) f = spectra_kmno4_f;

    let canvas = document.getElementById("canvas");
    if (canvas && canvas instanceof HTMLCanvasElement) {
        let ctxt = canvas.getContext("2d");
        if (ctxt === null) throw "Context is null?";
        // let m = irgb_from_xyz(xyz_from_spectrum(x => f_fluor_white(x)));
        for(let i=start;i<end;i++) {
            ctxt.beginPath();
            // ctxt.stroke();
            // ctxt.fillRect()
            ctxt.fillStyle = '#FF0000';
            ctxt.fillRect(0.6 * (i-start), 130 * (1-f(i)) + 10, 0.6, 1);
            
        }
    }
}
function onCommandButton() {
    let h = document.getElementById("cmdbox");
    let h2 = h as HTMLTextAreaElement;
    let txt = h2.value;
    // console.log(typeof h);
    let [formula, quantity] = grandUnifiedTknr(txt);
    console.log(formula);
    console.log(quantity);
}