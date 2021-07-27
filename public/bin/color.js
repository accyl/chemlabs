"use strict";
/// <reference path='colorMatchFuncsCIExyz.ts'/>
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
// https://www.fourmilab.ch/documents/specrend/
// https://ejbio.imedpub.com/three-very-different-uvvis-absorption-spectra-of-threedifferent-transition-metals-found-in-biological-solutions.pdf
// Informatino from https://github.com/markkness/ColorPy/blob/master/colorpy/colormodels.py
// Important: "rgb - Colors expressed as red, green and blue values, in the nominal range 0.0 - 1.0.
// These are linear color values, meaning that doubling the number implies a doubling of the light intensity."
// This is a copy-paste port of ColorPy to ts: https://github.com/sbyrnes321/ColorPy-1/blob/master/colorpy/ciexyz.py
// Actually that's a fork of https://github.com/markkness/ColorPy/blob/master/colorpy/ciexyz.py
// START COPY
// # Assumed physical brightness of the monitor[W / m ^ 2]
// #   80 cd / m ^ 2 * 20.3 mW / cd(assuming light at 556 nm)
var DEFAULT_DISPLAY_INTENSITY = 1.624;
// # For reference, the physical luminance of several interesting objects ...
// # All values in cd / m ^ 2, where 1 cd = 1 candle = 20.3 milliwatts of light at 5560 A
// # Typical monitor at full blast = 80 cd / m ^ 2[Poynton, Color FAQ, p.4]
// # Candle = 5000
// # 40W Frosted Light Bulb = 25000
// # Clear sky = 4000
// # Moon = 2500
// # Sun = 1.6 x 10 ^ 9
// # an advertised LCD display(2008) = 300 cd / m ^ 2
var _a = function () {
    function assert(b, s) {
        if (!b)
            throw s;
    }
    var start_wl_nm = 360;
    var end_wl_nm = 830;
    var delta_wl_nm = 1.0;
    var _wavelengths = [];
    var _xyz_colors = [];
    var _xyz_deltas = [];
    function init(display_intensity) {
        if (display_intensity === void 0) { display_intensity = DEFAULT_DISPLAY_INTENSITY; }
        // '''Initialize the spectral sampling curves.'''
        // # Expect that the table ranges from 360 to 830
        var table_size = _CIEXYZ_1931_table.length;
        var first = _CIEXYZ_1931_table[0][0];
        var last = _CIEXYZ_1931_table[_CIEXYZ_1931_table.length - 1][0];
        assert(first == start_wl_nm, 'Expecting first wavelength as ' + start_wl_nm + ' but instead is ' + first);
        assert(last == end_wl_nm, "Expecting last wavelength as " + end_wl_nm + " but instead is " + last);
        assert(table_size == 471, "Expecting 471 wavelength, each 1 nm from 360 to 830 nm, instead table size is " + table_size);
        // # Assume that the color for the wl just before and after the table(359 and 831) are zero.
        // # Also assume linear interpolation of the values for in -between nanometer wavelengths.
        // # Construct arrays, with elements for each wavelength, as the xyz color,
        // # and the change in color to the next largest nanometer.
        // # We will add an(empty) entry for 359 nm and 831 nm.
        var create_table_size = table_size + 2;
        _wavelengths = new Array(create_table_size);
        _xyz_colors = __spreadArray([], Array(create_table_size)).map(function (e) { return [0, 0, 0]; });
        _xyz_deltas = __spreadArray([], Array(create_table_size)).map(function (e) { return [0, 0, 0]; });
        // # fill in first row as 359 nm with zero color
        _wavelengths[0] = start_wl_nm - 1;
        // _xyz_colors[0] = colormodels.xyz_color(0.0, 0.0, 0.0)
        // # fill in last row as 831 nm with zero color
        _wavelengths[create_table_size - 1] = end_wl_nm + 1;
        // _xyz_colors[create_table_size - 1] = colormodels.xyz_color(0.0, 0.0, 0.0)
        // # fill in the middle rows from the source data
        for (var i = 0; i < _CIEXYZ_1931_table.length; i++) {
            var _a = _CIEXYZ_1931_table[i], wl = _a[0], x = _a[1], y = _a[2], z = _a[3];
            _wavelengths[i + 1] = wl;
            _xyz_colors[i + 1] = [x, y, z];
        }
        // # get the integrals of each curve
        var integral = [0, 0, 0];
        var _loop_1 = function (i) {
            var d_integral = _xyz_colors[i].map(function (xyz, j) { return 0.5 * (xyz + _xyz_colors[i + 1][j]) * delta_wl_nm; }); // trapezoidal sum approximation
            integral = integral.map(function (x, i) { return x + d_integral[i]; });
        };
        for (var i = 0; i < create_table_size - 1; i++) {
            _loop_1(i);
        }
        var num_wl = table_size;
        var scaling = num_wl / (integral[1] * display_intensity);
        _xyz_colors = _xyz_colors.map(function (x) { return x.map(function (y) { return y * scaling; }); }); // this is HORRIBLE TODO
        var _loop_2 = function (i) {
            _xyz_deltas[i] = _xyz_colors[i + 1].map(function (x, j) { return x - _xyz_colors[i][j]; });
        };
        // # now calculate all the deltas
        for (var i = 0; i < create_table_size - 1; i++) {
            _loop_2(i);
        }
        _xyz_deltas[create_table_size - 1] = [0, 0, 0];
    }
    init();
    /**
     * Given a wavelength (nm), return the corresponding xyz color, for unit intensity.
     * @param wl_nm wavelength, in nm
     */
    function xyz_from_wavelength(wl_nm) {
        // separate wl_nm into integer and fraction
        var int_wl_nm = Math.floor(wl_nm);
        var frac_wl_nm = wl_nm - int_wl_nm;
        // skip out of range(invisible) wavelengths
        if (int_wl_nm < start_wl_nm - 1 || int_wl_nm > end_wl_nm + 1)
            return [0, 0, 0];
        // get index into main table
        var index = int_wl_nm - start_wl_nm + 1;
        // apply linear interpolation to get the color
        return _xyz_colors[index].map(function (x, i) { return x + frac_wl_nm * _xyz_deltas[index][i]; });
    }
    /**
     * Determine the xyz color of the spectrum.
     * The spectrum is assumed to be a 2D numpy array, with a row for each wavelength,
     * and two columns.The first column should hold the wavelength(nm), and the
     * second should hold the light intensity.The set of wavelengths can be arbitrary,
     *   it does not have to be the set that empty_spectrum() returns.
     * @param spectrum
     * @returns
     */
    function xyz_from_spectrum(spectrum) {
        // assert num_col == 2, 'Expecting 2D array with each row: wavelength [nm], specific intensity [W/unit solid angle]'
        // integrate
        var rtn = [0, 0, 0];
        var _loop_3 = function (wl) {
            // wl_nm_i = spectrum[i][0];
            var specific_intensity_i = spectrum(wl);
            var xyz = xyz_from_wavelength(wl);
            rtn = xyz.map(function (xyz, i) { return +rtn[i] + xyz * specific_intensity_i; }); // rtn = rtn + xyz * specific_intensity
        };
        for (var wl = start_wl_nm; wl < end_wl_nm; wl += delta_wl_nm) {
            _loop_3(wl);
        }
        return rtn;
    }
    // the following code is from https://github.com/markkness/ColorPy/blob/master/colorpy/colormodels.py
    // function rgb_from_xyz(xyz):
    // return numpy.dot(rgb_from_xyz_matrix, xyz)
    // 
    // function irgb_from_xyz(xyz):
    // return irgb_from_rgb(rgb_from_xyz(xyz));
    // let rgb_from_xyz_matrix = [[3.24096994, -1.53738318, -0.49861076],
    // [-0.96924364, 1.8759675, 0.04155506],
    // [0.05563008, -0.20397696, 1.05697151]];
    // function mult(mtx: num[][], vec: num[]) {
    //     return mtx.map((arr) => arr.reduce((accum, val, j) => accum + val * vec[j], 0));
    // }
    return [xyz_from_spectrum, xyz_from_wavelength];
}(), xyz_from_spectrum = _a[0], xyz_from_wavelength = _a[1];
function f_whitish(wl) {
    if (wl > 640) {
        if (wl > 700)
            return 1 / 32;
        return 1 / 8;
        return 1 / 8 * (1 - (wl - 640) / (830 - 640));
    }
    // if(wl < 400) {
    // return 1/8;
    // }
    return 1;
    // returning only 1 produces rgb [255, 230, 225]
    // we need more greens and blues and less red
}
// specific intensity: W/m^2 or [W/unit solid angle]
// W = watts = radiant flux = energy/time = J/s
// 
/**
 * Source: https://www.researchgate.net/figure/Examples-of-typical-emission-spectra-from-the-sun-top-and-4100-K-FL-bottom_fig5_332195692
 * We use two lines to approximate it _very_ roughly
 * @param wavelength
 */
function f_daylight(wl) {
    // (440, .882) => (450, .882)
    // (360, .264)
    // (830, .569)
    // (800, .525)
    // (350, .102)
    var factor = 1;
    // between 754 and 766 there's a big downwards spike
    if (754 <= wl && wl <= 766) {
        factor = 0.3;
    }
    if (wl < 450) {
        // y-y0 = m(x-x0)
        // y = m(x-x0) + y0
        // m = (440-360) / (.882-.264) = 129.44983818770226
        // return (.882 - .102)/(450 - 350) * (wl - 450) + .882;// [255, 252, 255] (!!!)
        return (.882 - .02) / (450 - 350) * (wl - 450) + .882; // [255, 252, 255]
    }
    // return factor * ((.882 - .525) / (450 - 800) * (wl - 450) + .882);// * (wl-450)/(830-450) * .999;
    // return factor * ((.882 - .4) / (450 - 800) * (wl - 450) + .882); // reduce it a bit to make empirically less red
    // [255, 252, 255] (!!!)
    return factor * ((.882 - .39) / (450 - 800) * (wl - 450) + .882);
}
function f_fluor_white(wavelen) {
    // downwards parabola at (580, .714) = point 0
    // parabola also goes thru (650, .174) = point 1
    // spikes @ (435, .712), (544, .986), (577, .842), (403, .181)
    // spikes
    if (402 <= wavelen && wavelen <= 404)
        return .181; // purple
    if (434 <= wavelen && wavelen <= 438)
        return .712;
    if (543 <= wavelen && wavelen <= 545)
        return .986;
    if (576 <= wavelen && wavelen <= 578)
        return .842;
    if (515 <= wavelen && wavelen <= 650) { // parabola only valid in narrow strip
        // (y-y0) = a(x-x0)^2 where a < 0
        // (y1-y0) = a(x1-x0)^2
        // (y1-y0)/(x1-x0)^2 = a
        var a = (.174 - .714) / (Math.pow((650 - 580), 2));
        return a * Math.pow((wavelen - 580), 2) + .714;
    }
    // (580, .203)
    // (350, 0)
    // else use a line
    // y = m(x-x0) + y0
    if (wavelen < 580) {
        return (.203 / (580 - 350)) * (wavelen - 350) + 0;
    }
    // return ((.203 / (580 - 350)) * -(wavelen - 580) + .203) * Math.exp(-(wavelen-580)/250); // absolute vaule, good up to 930
    // return Math.max(Math.exp(-(wavelen - 580) / 250) / 1.5 - .3, 0);
    return Math.exp(-(1 / 50 * (wavelen - 580))) - .1;
}
