function defButton() {
    let sub = KMnO4.form();
    tang(sub);

    let sub2 = w('KMnO4');
    sub2.physhook!.pos = [10, 0, 0];
    redraw();
}

function slider() {
    let h = document.querySelector("#slider") as any;
    for(let s of glob.s) {
        if(s instanceof AqueousSubstance) {
            // s.concentration = h.value / 10000000;
            s.concentration = h.value / 10;

            redraw();
        }
    }

    let canvas = document.getElementById("canvas");
    if (canvas && canvas instanceof HTMLCanvasElement) {
        let ctxt = canvas.getContext("2d");
        if (ctxt === null) throw "Context is null?";
        gvar.ctxt = ctxt;
        // let m = irgb_from_xyz(xyz_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 1000)));
        // let m = rgb_from_spectrum(f_daylight);

        let m = rgb_from_spectrum(x => transmittance(spectra_kmno4_f(x), h.value / 10));

        ctxt.beginPath();
        makeRect(0, 10, 10, 10, m);

        let n = rgb_from_spectrum_concen(spectra_kmno4_f, h.value / 10);
        makeRect(0, 20, 10, 10, n);

        let p = rgb_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x) / 46 / (149 * 10 ^ -6), h.value / 10));
        makeRect(0, 30, 10, 10, p);
        
        // let kmno4_base_xyz = [148.40102601907597, 113.28932147129379, 170.4166480460002];
        // let q = rgb_from_base_xyz(kmno4_base_xyz, h.value / 10);
        // ctxt.fillStyle = _hex(q[0], q[1], q[2]);
        // ctxt.fillRect(0, 40, 10, 10);
    }

    // rgb_from_xyz(xyz_from_spectrum(x => transmittance(spectra_kmno4_f(x), 1)));
}

function makeRect(x: num, y: num, width: num, height: num, col: num[], ctxt?: CanvasRenderingContext2D) {
    // if(!ctxt) {
        // ctxt = gvar.ctxt;
    // }
    if(!ctxt) {
        let h = document.getElementsByTagName('canvas')[0];
        let c = undefined;
        if(h) c = h.getContext('2d');
        if(c) {
            ctxt = c;
        } else throw "Couldn't find context for canvas";
    }
    ctxt.fillStyle = _hex(col[0], col[1], col[2]);
    ctxt.fillRect(x, y, width, height);
}

function graph(f?: (x: num) => num, start: num = 360, end: num = 830) {
    // if(!f) f = f_daylight;
    if (!f) f = spectra_kmno4_f;

    let canvas = document.getElementById("canvas");
    if (canvas && canvas instanceof HTMLCanvasElement) {
        let ctxt = canvas.getContext("2d");
        if (ctxt === null) throw "Context is null?";
        // let m = irgb_from_xyz(xyz_from_spectrum(x => f_fluor_white(x)));
        for (let i = start; i < end; i++) {
            ctxt.beginPath();
            // ctxt.stroke();
            // ctxt.fillRect()
            ctxt.fillStyle = '#FF0000';
            ctxt.fillRect(0.6 * (i - start), 130 * (1 - f(i)) + 10, 0.6, 1);

        }
    }
}

function onCommandButton() {
    let h = document.getElementById("cmdbox");
    let h2 = h as HTMLTextAreaElement;
    let txt = h2.value;
    // console.log(typeof h);
    // let [formula, quantity] = grandUnifiedTknr(txt);
    // console.log(formula);
    // console.log(quantity);
    let s = w(txt);
    console.log(s);
    return s;
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