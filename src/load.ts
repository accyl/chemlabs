function defButton() {
    let sub = KMnO4.form();
    tang(sub);
    redraw();
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
        ctxt.fillStyle = _hex(m[0], m[1], m[2]);
        ctxt.fillRect(0, 10, 10, 10);

        let n = rgb_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 10));
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
    let [formula, quantity] = grandUnifiedTknr(txt);
    console.log(formula);
    console.log(quantity);
}

let __ = function () {
    let h = document.getElementById("cmdbox") as HTMLTextAreaElement;
    function submitOnEnter(event: any) {
        if (event.which === 13) {
            // event.target.form.dispatchEvent(new Event("submit", { cancelable: true }));
            event.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
            onCommandButton();
            // console.log('hi!');
        }
    }

    h.addEventListener("keypress", submitOnEnter);
}();