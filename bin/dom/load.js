"use strict";
function addDefault() {
    let sub = W.c('KMnO4').form();
    tang(sub);
    let sub2 = W('KMnO4');
    // sub2.physhook!.pos = {x:10, y:0};
    redraw();
}
function slider() {
    let h = document.querySelector("#slider");
    for (let s of glob.substances) {
        if ('concentration' in s) {
            // s.concentration = h.value / 10000000;
            // s.concentration = h.value / 10;
            // apparently the maximum molarity of KMnO4 is a mere 0.405 M lol
            s.concentration = h.value / 2500;
            redraw();
        }
    }
    let canvas = document.getElementById("canvas");
    let hud = document.getElementById("hud");
    if (hud && hud instanceof HTMLCanvasElement) {
        let ctx = hud.getContext("2d");
        if (ctx === null)
            throw "Context is null?";
        // gvar.ctxt = ctxt;
        // let m = irgb_from_xyz(xyz_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 1000)));
        // let m = rgb_from_spectrum(f_daylight);
        let m = rgb_from_spectrum(x => transmittance(spectra_kmno4_f(x), h.value / 2500)); // / 10));
        // ctxt.beginPath();
        makeRect(0, 10, 10, 10, m, ctx);
        let n = rgb_from_spectrum_concen(spectra_kmno4_f, h.value / 2500); // / 10);
        makeRect(0, 20, 10, 10, n, ctx);
        //  / 46 / (149 * 10 ^ -6)
        let p = rgb_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 2500)); // 10));
        makeRect(0, 30, 10, 10, p, ctx);
        // let kmno4_base_xyz = [148.40102601907597, 113.28932147129379, 170.4166480460002];
        // let q = rgb_from_base_xyz(kmno4_base_xyz, h.value / 10);
        // ctxt.fillStyle = _hex(q[0], q[1], q[2]);
        // ctxt.fillRect(0, 40, 10, 10);
    }
    // rgb_from_xyz(xyz_from_spectrum(x => transmittance(spectra_kmno4_f(x), 1)));
}
function makeRect(x, y, width, height, col, ctxt) {
    // if(!ctxt) {
    // ctxt = gvar.ctxt;
    // }
    if (!ctxt) {
        let h = document.getElementsByTagName('canvas')[0];
        let c = undefined;
        if (h)
            c = h.getContext('2d');
        if (c) {
            ctxt = c;
        }
        else
            throw "Couldn't find context for canvas";
    }
    ctxt.fillStyle = _hex(col[0], col[1], col[2]);
    ctxt.fillRect(x, y, width, height);
}
function graph(f, start = 360, end = 830) {
    if (!f)
        f = f_daylight;
    // if (!f) f = spectra_kmno4_f;
    let ctx = getCanvasContext();
    // let m = irgb_from_xyz(xyz_from_spectrum(x => f_fluor_white(x)));
    for (let i = start; i < end; i++) {
        ctx.beginPath();
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0.6 * (i - start), 130 * (1 - f(i)) + 10, 0.6, 1);
        ctx.stroke();
    }
}
function onCommandButton() {
    let h = document.getElementById("cmdbox");
    let h2 = h;
    let txt = h2.value;
    // console.log(typeof h);
    // let [formula, quantity] = grandUnifiedTknr(txt);
    // console.log(formula);
    // console.log(quantity);
    let s = W(txt);
    console.log(s);
    return s;
}
function debugBody(body) {
    let paste = document.getElementsByClassName('db-vw-paste')[0];
    if ('substs' in body) {
        let ph = body;
        let ret = '';
        if (!(ph.substs instanceof SubstGroup))
            throw "substs field isn't a system?";
        let ss = ph.substs;
        lastClickedObject = ss;
        for (let s of ss.substances) {
            ret += `${s.type.chemicalFormula} (${s.state ? s.state : 'state unknown'}) ${s.mass}g ${s.volume}L ${s.temperature}K \n`;
        }
        paste.textContent = ret;
    }
    else {
        paste.textContent = "None";
    }
}
// __ = function () {
//     let h = document.getElementById("cmdbox") as HTMLTextAreaElement;
//     function submitOnEnter(event: any) {
//         if (event.which === 13) {
//             // event.target.form.dispatchEvent(new Event("submit", { cancelable: true }));
//             event.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
//             return onCommandButton();
//             // console.log('hi!');
//         }
//     }
//     h.addEventListener("keypress", submitOnEnter);
// }();
addDefault();
class CanvasButton {
    /**
     * @param rectMode Uses a string equal to https://processing.org/reference/rectMode_.html
     */
    constructor(x, y, width, height, text, rectMode = 'CORNER') {
        this.x = 100;
        this.y = 100;
        this.width = 100;
        this.height = 100;
        this.text = 'button';
        this.fill = '#00000044';
        this.width = width;
        this.height = height;
        this.text = text;
        if (rectMode === 'CENTER') {
            this.x = x - width / 2;
            this.y = y - height / 2;
        }
        else {
            this.x = x;
            this.y = y;
        }
    }
    drawSelf() {
        let ctx = getCanvasContext();
        ctx.fillStyle = this.fill;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '40px sans-serif';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#000000';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2, this.width);
    }
}
class ButtonManager {
    constructor() {
        this.buttons = [];
    }
    _isInside(pos, rect) {
        return rect.x < pos.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && rect.y < pos.y;
    }
    onButtonClicked(idx, b) {
        if (idx === this.buttons.length - 1) {
            // resume
            pauseUnpauseGame(false);
            return;
        }
    }
    ;
    onclick(e) {
        // var mousePos = getMousePos(canvas, evt);
        var rect = canvas.getBoundingClientRect();
        var mousepos = {
            x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
        for (let i = 0; i < this.buttons.length; i++) {
            if (this._isInside(mousepos, this.buttons[i])) {
                this.onButtonClicked(i, this.buttons[i]);
            }
        }
        // console.log(mousepos);
    }
    ;
    onhover(e, callback) {
        var rect = canvas.getBoundingClientRect();
        var mousepos = {
            x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
        for (let i = 0; i < this.buttons.length; i++) {
            if (this._isInside(mousepos, this.buttons[i])) {
                this.onButtonClicked(i, this.buttons[i]);
                callback(e, i);
            }
        }
    }
}
let pauseButtons = new ButtonManager();
pauseButtons.buttons = (function () {
    let can = getCanvas();
    let b = [];
    b.push(new CanvasButton(can.width / 2, can.height * 2 / 6, 400, 80, 'Credits', 'CENTER')); // can.width, can.height);
    b.push(new CanvasButton(can.width / 2, can.height * 3 / 6, 400, 80, 'Resume', 'CENTER')); // can.width, can.height);
    return b;
}());
(function () {
    pauseButtons.onButtonClicked = function (i, x) {
        if (i === 0) { // Credits. Yeah ik it's hardcoded. Oh well indices are fast.
            transitionScreenTo(ScreenState.CREDITS);
        }
        else if (i === this.buttons.length - 1) {
            // resume
            pauseUnpauseGame(false);
            return;
        }
    };
}());
let creditsButtons = new ButtonManager();
creditsButtons.buttons = (function () {
    let can = getCanvas();
    let b = [];
    b.push(new CanvasButton(can.width / 2, can.height * 5 / 6, 400, 80, 'Back', 'CENTER')); // can.width, can.height);
    return b;
}());
creditsButtons.onButtonClicked = function (i, x) {
    transitionScreenTo(ScreenState.PAUSED);
};
function fillText(ctx, txt, x, y, txtheight = 50) {
    let idx = 0;
    for (let part of txt.split('\n')) {
        idx++;
        ctx.fillText(part, x, y + idx * txtheight, ctx.canvas.width);
    }
}
function transitionScreenTo(state) {
    if (state === ScreenState.CREDITS) {
        if (!universe.paused)
            pauseUnpauseGame(true);
        universe.screenstate = ScreenState.CREDITS;
        let can = getCanvas();
        let ctx = getCanvasContext(can);
        redraw();
        ctx.fillStyle = '#DDDDDDEE';
        ctx.fillRect(0, 0, can.width, can.height);
        ctx.font = '50px sans-serif';
        ctx.fillStyle = '#000000';
        fillText(ctx, 'Creator: github.com/accyl\n\nInspired by: \nPowder Game by Dan-Ball \nElemental 3 by carykh \nElemental Community by davecaruso', can.width / 2, can.height / 8);
        for (let b of creditsButtons.buttons)
            b.drawSelf();
    }
    else if (state === ScreenState.PAUSED) {
        pauseUnpauseGame(true);
        universe.screenstate = ScreenState.PAUSED;
    }
    else if (state === ScreenState.RUNNING) {
        pauseUnpauseGame(false);
        universe.screenstate = ScreenState.RUNNING;
    }
}
/**
 *
 * @param pause Pass undefined or no argument to toggle.
 */
function pauseUnpauseGame(pause) {
    if (pause === undefined) {
        // toggle is default behavior
        pause = universe.runner.enabled;
        // universe.runner.enabled = !universe.runner.enabled
    }
    if (pause) {
        universe.runner.enabled = false;
        universe.paused = true;
        universe.screenstate = ScreenState.PAUSED;
        let canv = getCanvas();
        let ctx = getCanvasContext(canv);
        ctx.globalAlpha = 0.75;
        // ctx.filter = 'blur(2px)';
        redraw();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canv.width, canv.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000000';
        ctx.font = '50px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canv.width / 2, canv.height / 6);
        for (let b of pauseButtons.buttons)
            b.drawSelf();
    }
    else { // unpause
        universe.runner.enabled = true;
        universe.paused = false;
        universe.screenstate = ScreenState.RUNNING;
        let ctx = getCanvasContext();
        ctx.globalAlpha = 1;
        // ctx.filter = 'none';
        // redraw();
    }
}
(function () {
    var canvas = getCanvas();
    var ctx = getCanvasContext(canvas);
    //The rectangle should have x,y,width,height properties
    //Function to check whether a point is inside a rectangle
    //Binding the click event on the canvas
    canvas.addEventListener('click', function (evt) {
        if (universe.screenstate === ScreenState.PAUSED)
            pauseButtons.onclick(evt);
        else if (universe.screenstate === ScreenState.CREDITS)
            creditsButtons.onclick(evt);
    }, false);
    canvas.addEventListener('hover', function (evt) {
    });
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            // Escape key
            // universe.runner.isRunning = false;
            // Matter.Runner.stop(universe.runner);
            // universe.runner.enabled = !universe.runner.enabled;
            pauseUnpauseGame();
        }
        // console.log(e.key); // debug
    }, false);
    // Make sure this code gets executed after the DOM is loaded.
})();
