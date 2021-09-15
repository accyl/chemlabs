"use strict";
function addDefault() {
    var sub = KMnO4.form();
    tang(sub);
    var sub2 = w('KMnO4');
    // sub2.physhook!.pos = {x:10, y:0};
    redraw();
}
function slider() {
    var h = document.querySelector("#slider");
    for (var _i = 0, _a = glob.substances; _i < _a.length; _i++) {
        var s = _a[_i];
        if (s instanceof AqueousSubstance) {
            // s.concentration = h.value / 10000000;
            // s.concentration = h.value / 10;
            // apparently the maximum molarity of KMnO4 is a mere 0.405 M lol
            s.concentration = h.value / 2500;
            redraw();
        }
    }
    var canvas = document.getElementById("canvas");
    var hud = document.getElementById("hud");
    if (hud && hud instanceof HTMLCanvasElement) {
        var ctx_1 = hud.getContext("2d");
        if (ctx_1 === null)
            throw "Context is null?";
        // gvar.ctxt = ctxt;
        // let m = irgb_from_xyz(xyz_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 1000)));
        // let m = rgb_from_spectrum(f_daylight);
        var m = rgb_from_spectrum(function (x) { return transmittance(spectra_kmno4_f(x), h.value / 2500); }); // / 10));
        // ctxt.beginPath();
        makeRect(0, 10, 10, 10, m, ctx_1);
        var n = rgb_from_spectrum_concen(spectra_kmno4_f, h.value / 2500); // / 10);
        makeRect(0, 20, 10, 10, n, ctx_1);
        //  / 46 / (149 * 10 ^ -6)
        var p = rgb_from_spectrum(function (x) { return f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 2500); }); // 10));
        makeRect(0, 30, 10, 10, p, ctx_1);
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
        var h = document.getElementsByTagName('canvas')[0];
        var c = undefined;
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
function graph(f, start, end) {
    if (start === void 0) { start = 360; }
    if (end === void 0) { end = 830; }
    if (!f)
        f = f_daylight;
    // if (!f) f = spectra_kmno4_f;
    var ctx = getCanvasContext();
    // let m = irgb_from_xyz(xyz_from_spectrum(x => f_fluor_white(x)));
    for (var i = start; i < end; i++) {
        ctx.beginPath();
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0.6 * (i - start), 130 * (1 - f(i)) + 10, 0.6, 1);
        ctx.stroke();
    }
}
function onCommandButton() {
    var h = document.getElementById("cmdbox");
    var h2 = h;
    var txt = h2.value;
    // console.log(typeof h);
    // let [formula, quantity] = grandUnifiedTknr(txt);
    // console.log(formula);
    // console.log(quantity);
    var s = w(txt);
    console.log(s);
    return s;
}
function debugBody(body) {
    var paste = document.getElementsByClassName('db-vw-paste')[0];
    if ('substs' in body) {
        var ph = body;
        var ret = '';
        if (!(ph.substs instanceof SubstGroup))
            throw "substs field isn't a system?";
        var ss = ph.substs;
        lastClickedObject = ss;
        for (var _i = 0, _a = ss.substances; _i < _a.length; _i++) {
            var s = _a[_i];
            ret += s.type.chemicalFormula + " (" + s.state + ") " + s.mass + "g " + s.volume + "L " + s.temperature + "K \n";
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
var CanvasButton = /** @class */ (function () {
    /**
     * @param rectMode Uses a string equal to https://processing.org/reference/rectMode_.html
     */
    function CanvasButton(x, y, width, height, text, rectMode) {
        if (rectMode === void 0) { rectMode = 'CORNER'; }
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
    CanvasButton.prototype.drawSelf = function () {
        var ctx = getCanvasContext();
        ctx.fillStyle = this.fill;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '40px sans-serif';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#000000';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2, this.width);
    };
    return CanvasButton;
}());
var ButtonManager = /** @class */ (function () {
    function ButtonManager() {
        this.buttons = [];
    }
    ButtonManager.prototype._isInside = function (pos, rect) {
        return rect.x < pos.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && rect.y < pos.y;
    };
    ButtonManager.prototype.onButtonClicked = function (idx, b) {
        if (idx === this.buttons.length - 1) {
            // resume
            pauseUnpauseGame(false);
            return;
        }
    };
    ;
    ButtonManager.prototype.onclick = function (e) {
        // var mousePos = getMousePos(canvas, evt);
        var rect = canvas.getBoundingClientRect();
        var mousepos = {
            x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
        for (var i = 0; i < this.buttons.length; i++) {
            if (this._isInside(mousepos, this.buttons[i])) {
                this.onButtonClicked(i, this.buttons[i]);
            }
        }
        // console.log(mousepos);
    };
    ;
    return ButtonManager;
}());
var pauseButtons = new ButtonManager();
pauseButtons.buttons = (function () {
    var can = getCanvas();
    var b = [];
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
var creditsButtons = new ButtonManager();
creditsButtons.buttons = (function () {
    var can = getCanvas();
    var b = [];
    b.push(new CanvasButton(can.width / 2, can.height * 2 / 6, 400, 80, 'Back', 'CENTER')); // can.width, can.height);
    return b;
}());
creditsButtons.onButtonClicked = function (i, x) {
    transitionScreenTo(ScreenState.PAUSED);
};
function transitionScreenTo(state) {
    if (state === ScreenState.CREDITS) {
        if (!universe.paused)
            pauseUnpauseGame(true);
        universe.screenstate = ScreenState.CREDITS;
        var can = getCanvas();
        var ctx_2 = getCanvasContext(can);
        ctx_2.fillStyle = '#DDDDDD';
        ctx_2.fillRect(0, 0, can.width, can.height);
        ctx_2.font = '50px sans-serif';
        ctx_2.fillStyle = '#000000';
        ctx_2.fillText('Inspired by: \n Powder Game by Dan-Ball \n Elemental 3 by carykh \n Elemental Community by davecaruso?', can.width / 2, can.height / 2, can.width);
        for (var _i = 0, _a = creditsButtons.buttons; _i < _a.length; _i++) {
            var b_1 = _a[_i];
            b_1.drawSelf();
        }
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
        var canv = getCanvas();
        var ctx_3 = getCanvasContext(canv);
        ctx_3.globalAlpha = 0.75;
        // ctx.filter = 'blur(2px)';
        redraw();
        ctx_3.fillStyle = '#FFFFFF';
        ctx_3.fillRect(0, 0, canv.width, canv.height);
        ctx_3.globalAlpha = 1;
        ctx_3.fillStyle = '#000000';
        ctx_3.font = '50px sans-serif';
        ctx_3.textAlign = 'center';
        ctx_3.fillText('PAUSED', canv.width / 2, canv.height / 6);
        for (var _i = 0, _a = pauseButtons.buttons; _i < _a.length; _i++) {
            var b_2 = _a[_i];
            b_2.drawSelf();
        }
    }
    else { // unpause
        universe.runner.enabled = true;
        universe.paused = false;
        universe.screenstate = ScreenState.RUNNING;
        var ctx_4 = getCanvasContext();
        ctx_4.globalAlpha = 1;
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
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            // Escape key
            // universe.runner.isRunning = false;
            // Matter.Runner.stop(universe.runner);
            // universe.runner.enabled = !universe.runner.enabled;
            pauseUnpauseGame();
        }
        console.log(e.key); // debug
    }, false);
})();
