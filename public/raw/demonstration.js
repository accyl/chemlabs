/// <reference path="../bin/first.js"/>
/// <reference path="../bin/color/color.js"/>
/// <reference path="../bin/color/colormodels.js"/>
/// <reference path="../bin/color/colortest.js"/>
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
(function() {
    let all_ones = (wl) => 1;
    
    let col = rgb_from_spectrum(all_ones);
    let hexcol = _hex(...col);
    ctx.fillStyle = hexcol;
    ctx.fillRect(0, 0, 100, 100);

    // let all_ones = (wl) => 1;
    let col2 = rgb_from_spectrum(f_daylight);
    let hexcol2 = _hex(...col2);
    ctx.fillStyle = hexcol2;
    ctx.fillRect(100, 0, 100, 100);



})();