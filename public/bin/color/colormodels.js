"use strict";
// SOURCE: https://github.com/markkness/ColorPy/blob/f2dad2c268895d4b046b767f3aa884f2889b84cb/colorpy/colormodels.py#L469
// PORTED to ts
// Transcrypt'ed from Python, 2021-06-22 09:56:35
// import {AssertionError, AttributeError, BaseException, DeprecationWarning, Exception, IndexError, IterableError, KeyError, NotImplementedError, RuntimeWarning, StopIteration, UserWarning, ValueError, Warning, __JsIterator__, __PyIterator__, __Terminal__, __add__, __and__, __call__, __class__, __envir__, __eq__, __floordiv__, __ge__, __get__, __getcm__, __getitem__, __getslice__, __getsm__, __gt__, __i__, __iadd__, __iand__, __idiv__, __ijsmod__, __ilshift__, __imatmul__, __imod__, __imul__, __in__, __init__, __ior__, __ipow__, __irshift__, __isub__, __ixor__, __jsUsePyNext__, __jsmod__, __k__, __kwargtrans__, __le__, __lshift__, __lt__, __matmul__, __mergefields__, __mergekwargtrans__, __mod__, __mul__, __ne__, __neg__, __nest__, __or__, __pow__, __pragma__, __pyUseJsNext__, __rshift__, __setitem__, __setproperty__, __setslice__, __sort__, __specialattrib__, __sub__, __super__, __t__, __terminal__, __truediv__, __withblock__, __xor__, abs, all, any, assert, bool, bytearray, bytes, callable, chr, copy, deepcopy, delattr, dict, dir, divmod, enumerate, filter, float, getattr, hasattr, input, int, isinstance, issubclass, len, list, map, max, min, object, ord, pow, print, property, py_TypeError, py_iter, py_metatype, py_next, py_reversed, py_typeof, range, repr, round, set, setattr, sorted, str, sum, tuple, zip} from './org.transcrypt.__runtime__.js';
// import {max, min, float} from './org.transcrypt.__runtime__.js';
// import {int, round, max, min, len} from './python';
// / <reference path='lodash.min.js'/>
// import * as _ from 'lodash';
// import _ from 'lodash';
// var [irgb_from_xyz, rgb_from_xyz, xyz_color] = 
let irgb_from_xyz;
let rgb_from_xyz;
let xyz_color;
__ = function () {
    // selected python polyfill from org.transcrypt.__runtime__.js
    /**/ function int(number) {
        return number > 0
            ? Math.floor(number)
            : Math.ceil(number);
    }
    /**/ function max(...nums) {
        // return arguments.length == 1 ? Math.max(...nrOrSeq) : Math.max(...arguments);
        return Math.max(...nums);
    }
    ;
    /**/ function min(...nums) {
        // return arguments.length == 1 ? Math.min(...nrOrSeq) : Math.min(...arguments);
        return Math.min(...nums);
    }
    ;
    /**/ function round(num) {
        // return arguments.length == 1 ? Math.min(...nrOrSeq) : Math.min(...arguments);
        return Math.round(num);
    }
    ;
    /**/ function len(obj) {
        if (obj === undefined || obj === null) {
            return 0;
        }
        return obj.length;
    }
    ;
    // end python polyfill
    // var __name__ = '__main__';
    /**/ xyz_color = function (x, y, z) {
        // if (typeof z == 'undefined' || (z != null && z.hasOwnProperty ("__kwargtrans__"))) {;
        // z = null;
        // };
        if (z === undefined) {
            z = 1.0 - (x + y);
        }
        var rtn = [x, y, z];
        return rtn;
    };
    /**/ var xyz_normalize = function (xyz) {
        var sum_xyz = (xyz[0] + xyz[1]) + xyz[2];
        if (sum_xyz != 0.0) {
            var scale = 1.0 / sum_xyz;
            xyz[0] *= scale;
            xyz[1] *= scale;
            xyz[2] *= scale;
        }
        return xyz;
    };
    /**/ var xyz_normalize_Y1 = function (xyz) {
        if (xyz[1] != 0.0) {
            var scale = 1.0 / xyz[1];
            xyz[0] *= scale;
            xyz[1] *= scale;
            xyz[2] *= scale;
        }
        return xyz;
    };
    /**/ var xyz_color_from_xyY = function (x, y, Y) {
        return xyz_color((x / y) * Y, Y, (((1.0 - x) - y) / y) * Y);
    };
    /**/ var rgb_color = function (r, g, b) {
        var rtn = [r, g, b];
        return rtn;
    };
    /**/ var irgb_color = function (ir, ig, ib) {
        var rtn = [Math.floor(ir), Math.floor(ig), Math.floor(ib)];
        return rtn;
    };
    /**/ var luv_color = function (L, u, v) {
        var rtn = [L, u, v];
        return rtn;
    };
    /**/ var lab_color = function (L, a, b) {
        var rtn = [L, a, b];
        return rtn;
    };
    /**/ var SRGB_Red = xyz_color(0.64, 0.33);
    /**/ var SRGB_Green = xyz_color(0.3, 0.6);
    /**/ var SRGB_Blue = xyz_color(0.15, 0.06);
    /**/ var SRGB_White = xyz_color(0.3127, 0.329);
    /**/ var HDTV_Red = xyz_color(0.64, 0.33);
    /**/ var HDTV_Green = xyz_color(0.3, 0.6);
    /**/ var HDTV_Blue = xyz_color(0.15, 0.06);
    /**/ var SMPTE_Red = xyz_color(0.63, 0.34);
    /**/ var SMPTE_Green = xyz_color(0.31, 0.595);
    /**/ var SMPTE_Blue = xyz_color(0.155, 0.07);
    /**/ var NTSC_Red = xyz_color(0.67, 0.33);
    /**/ var NTSC_Green = xyz_color(0.21, 0.71);
    /**/ var NTSC_Blue = xyz_color(0.14, 0.08);
    /**/ var FoleyShort_Red = xyz_color(0.61, 0.35);
    /**/ var FoleyShort_Green = xyz_color(0.29, 0.59);
    /**/ var FoleyShort_Blue = xyz_color(0.15, 0.063);
    /**/ var FoleyLong_Red = xyz_color(0.62, 0.33);
    /**/ var FoleyLong_Green = xyz_color(0.21, 0.685);
    /**/ var FoleyLong_Blue = xyz_color(0.15, 0.063);
    /**/ var Judd_Red = xyz_color(0.68, 0.32);
    /**/ var Judd_Green = xyz_color(0.28, 0.6);
    /**/ var Judd_Blue = xyz_color(0.15, 0.07);
    /**/ var WhiteA = xyz_color(0.4476, 0.4074);
    /**/ var WhiteB = xyz_color(0.3484, 0.3516);
    /**/ var WhiteC = xyz_color(0.3101, 0.3162);
    /**/ var WhiteD55 = xyz_color(0.3324, 0.3475);
    /**/ var WhiteD65 = xyz_color(0.3127, 0.329);
    /**/ var WhiteD75 = xyz_color(0.299, 0.315);
    /**/ var Blackbody6500K = xyz_color(0.3135, 0.3237);
    /**/ var Blackbody6600K = xyz_color(0.3121, 0.3223);
    /**/ var Blackbody6700K = xyz_color(0.3107, 0.3209);
    /**/ var Blackbody6800K = xyz_color(0.3092, 0.3194);
    /**/ var Blackbody6900K = xyz_color(0.3078, 0.318);
    /**/ var Blackbody7000K = xyz_color(0.3064, 0.3166);
    /**/ var MacBethWhite = xyz_color(0.30995, 0.31596, 0.37409);
    /**/ var srgb_rgb_from_xyz_matrix = [[3.241, -(1.5374), -(0.4986)], [-(0.9692), 1.876, 0.0416], [0.0556, -(0.204), 1.057]];
    /**/ var smpte_xyz_from_rgb_matrix = [[0.3935, 0.3653, 0.1916], [0.2124, 0.7011, 0.0865], [0.0187, 0.1119, 0.9582]];
    /**/ var smpte_rgb_from_xyz_matrix = [[3.5064, -(1.74), -(0.5441)], [-(1.069), 1.9777, 0.0352], [0.0563, -(0.197), 1.0501]];
    /**/ var PhosphorRed;
    /**/ var PhosphorGreen;
    /**/ var PhosphorBlue;
    /**/ var PhosphorWhite;
    /**/ var rgb_from_xyz_matrix;
    /**/ var xyz_from_rgb_matrix;
    /**/ var init = function (phosphor_red = SRGB_Red, phosphor_green = SRGB_Green, phosphor_blue = SRGB_Blue, white_point = SRGB_White) {
        PhosphorRed = phosphor_red;
        PhosphorGreen = phosphor_green;
        PhosphorBlue = phosphor_blue;
        PhosphorWhite = white_point;
        // var phosphor_matrix = numpy.column_stack (tuple ([phosphor_red, phosphor_green, phosphor_blue]));
        // var phosphor_matrix = _.zip(phosphor_red, phosphor_green, phosphor_blue) // get the transpose
        var normalized_white = [...white_point];
        xyz_normalize_Y1(normalized_white);
        // var intensities = numpy.linalg.solve (phosphor_matrix, normalized_white);
        // intensities = intensities as number[];
        // xyz_from_rgb_matrix = numpy.column_stack (tuple ([phosphor_red * intensities [0], phosphor_green * intensities [1], phosphor_blue * intensities [2]]));
        // xyz_from_rgb_matrix = _.zip(phosphor_red.map(x => x * intensities[0]), phosphor_green.map(x => x * intensities[1]), 
        // phosphor_blue.map(x => x * intensities[2])) as number[][];
        // rgb_from_xyz_matrix = numpy.linalg.inv (xyz_from_rgb_matrix);
        // just run it in python and copy over a cached version
        xyz_from_rgb_matrix = [[0.4123908, 0.35758434, 0.18048079],
            [0.21263901, 0.71516868, 0.07219232],
            [0.01933082, 0.11919478, 0.95053215]];
        rgb_from_xyz_matrix = [[3.24096994, -1.53738318, -0.49861076],
            [-0.96924364, 1.8759675, 0.04155506],
            [0.05563008, -0.20397696, 1.05697151]];
        // rgb_from_xyz_matrix = srgb_rgb_from_xyz_matrix;
        init_Luv_Lab_white_point(white_point);
        init_gamma_correction();
        init_clipping();
    };
    function mult(mtx, vec) {
        return mtx.map((arr) => arr.reduce((accum, val, j) => accum + val * vec[j], 0));
    }
    /**/ rgb_from_xyz = function (xyz) {
        return mult(rgb_from_xyz_matrix, xyz);
    };
    /**/ var xyz_from_rgb = function (rgb) {
        return mult(xyz_from_rgb_matrix, rgb);
    };
    /**/ var brightest_rgb_from_xyz = function (xyz, max_component = 1) {
        var rgb = rgb_from_xyz(xyz);
        var max_rgb = Math.max.apply(null, rgb);
        if (max_rgb != 0.0) {
            var scale = max_component / max_rgb;
            rgb = rgb.map(x => x * scale); // TODO investigate for each
        }
        return rgb;
    };
    /**/ var _reference_white;
    /**/ var _reference_u_prime;
    /**/ var _reference_v_prime;
    /**/ var init_Luv_Lab_white_point = function (white_point) {
        _reference_white = [...white_point];
        xyz_normalize_Y1(_reference_white);
        var __left0__ = uv_primes(_reference_white);
        _reference_u_prime = __left0__[0];
        _reference_v_prime = __left0__[1];
    };
    /**/ var L_LUM_A = 116.0;
    /**/ var L_LUM_B = 16.0;
    /**/ var L_LUM_C = 903.2962955130766;
    /**/ var L_LUM_CUTOFF = 0.008856;
    /**/ var L_luminance = function (y) {
        if (y > L_LUM_CUTOFF) {
            return L_LUM_A * Math.pow(y, 1.0 / 3.0) - L_LUM_B;
        }
        else {
            return L_LUM_C * y;
        }
    };
    /**/ var L_luminance_inverse = function (L) {
        if (L <= L_LUM_C * L_LUM_CUTOFF) {
            var y = L / L_LUM_C;
        }
        else {
            var t = (L + L_LUM_B) / L_LUM_A;
            var y = Math.pow(t, 3);
        }
        return y;
    };
    /**/ var uv_primes = function (xyz) {
        var x = xyz[0];
        var y = xyz[1];
        var z = xyz[2];
        var w_denom = (x + 15.0 * y) + 3.0 * z;
        if (w_denom != 0.0) {
            var u_prime = (4.0 * x) / w_denom;
            var v_prime = (9.0 * y) / w_denom;
        }
        else {
            var u_prime = 0.0;
            var v_prime = 0.0;
        }
        // return tuple ([u_prime, v_prime]);
        return [u_prime, v_prime];
    };
    /**/ var uv_primes_inverse = function (u_prime, v_prime, y) {
        if (v_prime != 0.0) {
            var w_denom = (9.0 * y) / v_prime;
            var x = (0.25 * u_prime) * w_denom;
            var y = y;
            var z = ((w_denom - x) - 15.0 * y) / 3.0;
        }
        else {
            var x = 0.0;
            var y = 0.0;
            var z = 0.0;
        }
        var xyz = xyz_color(x, y, z);
        return xyz;
    };
    /**/ var LAB_F_A = 7.787037030285142;
    /**/ var LAB_F_B = 16.0 / 116.0;
    /**/ var Lab_f = function (t) {
        if (t > L_LUM_CUTOFF) {
            return Math.pow(t, 1.0 / 3.0);
        }
        else {
            return LAB_F_A * t + LAB_F_B;
        }
    };
    /**/ var Lab_f_inverse = function (F) {
        if (F <= LAB_F_A * L_LUM_CUTOFF + LAB_F_B) {
            var t = (F - LAB_F_B) / LAB_F_A;
        }
        else {
            var t = Math.pow(F, 3);
        }
        return t;
    };
    /**/ var luv_from_xyz = function (xyz) {
        var y = xyz[1];
        var y_p = y / _reference_white[1];
        var __left0__ = uv_primes(xyz);
        var u_prime = __left0__[0];
        var v_prime = __left0__[1];
        var L = L_luminance(y_p);
        var u = (13.0 * L) * (u_prime - _reference_u_prime);
        var v = (13.0 * L) * (v_prime - _reference_v_prime);
        var luv = luv_color(L, u, v);
        return luv;
    };
    /**/ var xyz_from_luv = function (luv) {
        var L = luv[0];
        var u = luv[1];
        var v = luv[2];
        var y = L_luminance_inverse(L);
        if (L != 0.0) {
            var L13 = 13.0 * L;
            var u_prime = _reference_u_prime + u / L13;
            var v_prime = _reference_v_prime + v / L13;
            var xyz = uv_primes_inverse(u_prime, v_prime, y);
        }
        else {
            var xyz = xyz_color(0.0, 0.0, 0.0);
        }
        return xyz;
    };
    /**/ var lab_from_xyz = function (xyz) {
        var x = xyz[0];
        var y = xyz[1];
        var z = xyz[2];
        var x_p = x / _reference_white[0];
        var y_p = y / _reference_white[1];
        var z_p = z / _reference_white[2];
        var f_x = Lab_f(x_p);
        var f_y = Lab_f(y_p);
        var f_z = Lab_f(z_p);
        var L = L_luminance(y_p);
        var a = 500.0 * (f_x - f_y);
        var b = 200.0 * (f_y - f_z);
        var Lab = lab_color(L, a, b);
        return Lab;
    };
    /**/ var xyz_from_lab = function (Lab) {
        var L = Lab[0];
        var a = Lab[1];
        var b = Lab[2];
        var y_p = L_luminance_inverse(L);
        var f_y = Lab_f(y_p);
        var f_x = f_y + a / 500.0;
        var f_z = f_y - b / 200.0;
        var x_p = Lab_f_inverse(f_x);
        var z_p = Lab_f_inverse(f_z);
        var x = x_p * _reference_white[0];
        var y = y_p * _reference_white[1];
        var z = z_p * _reference_white[2];
        var xyz = xyz_color(x, y, z);
        return xyz;
    };
    /**/ var display_from_linear_component;
    /**/ var linear_from_display_component;
    /**/ var gamma_exponent;
    /**/ var STANDARD_GAMMA = 2.2;
    /**/ var POYNTON_GAMMA = 2.45;
    /**/ var simple_gamma_invert = function (x) {
        if (x <= 0.0) {
            return x;
        }
        else {
            return Math.pow(x, 1.0 / gamma_exponent);
        }
    };
    /**/ var simple_gamma_correct = function (x) {
        if (x <= 0.0) {
            return x;
        }
        else {
            return Math.pow(x, gamma_exponent);
        }
    };
    /**/ var srgb_gamma_invert = function (x) {
        if (x <= 0.00304) {
            var rtn = 12.92 * x;
        }
        else {
            var rtn = 1.055 * Math.pow(x, 1.0 / 2.4) - 0.055;
        }
        return rtn;
    };
    /**/ var srgb_gamma_correct = function (x) {
        if (x <= 0.03928) {
            var rtn = x / 12.92;
        }
        else {
            var rtn = Math.pow((x + 0.055) / 1.055, 2.4);
        }
        return rtn;
    };
    /**/ var init_gamma_correction = function (display_from_linear_function = srgb_gamma_invert, linear_from_display_function = srgb_gamma_correct, gamma = STANDARD_GAMMA) {
        display_from_linear_component = display_from_linear_function;
        linear_from_display_component = linear_from_display_function;
        gamma_exponent = gamma;
    };
    /**/ var _clip_method;
    /**/ var CLIP_CLAMP_TO_ZERO = 0;
    /**/ var CLIP_ADD_WHITE = 1;
    /**/ var init_clipping = function (clip_method = CLIP_ADD_WHITE) {
        _clip_method = clip_method;
    };
    /**/ var clip_rgb_color = function (rgb_color) {
        var clipped_chromaticity = false;
        var clipped_intensity = false;
        var rgb = [...rgb_color];
        if (_clip_method == CLIP_CLAMP_TO_ZERO) {
            if (rgb[0] < 0.0) {
                rgb[0] = 0.0;
                var clipped_chromaticity = true;
            }
            if (rgb[1] < 0.0) {
                rgb[1] = 0.0;
                var clipped_chromaticity = true;
            }
            if (rgb[2] < 0.0) {
                rgb[2] = 0.0;
                var clipped_chromaticity = true;
            }
        }
        else if (_clip_method == CLIP_ADD_WHITE) {
            var rgb_min = min(0.0, min(...rgb));
            var rgb_max = max(...rgb);
            var scaling = 1.0;
            if (rgb_max > 0.0) {
                var scaling = rgb_max / (rgb_max - rgb_min);
            }
            if (rgb_min < 0.0) {
                rgb[0] = scaling * (rgb[0] - rgb_min);
                rgb[1] = scaling * (rgb[1] - rgb_min);
                rgb[2] = scaling * (rgb[2] - rgb_min);
                var clipped_chromaticity = true;
            }
        }
        else {
            throw ` ValueError (__mod__ ('Invalid color clipping method ${_clip_method}', ))`;
            // __except0__.__cause__ = null;
            // throw __except0__;
        }
        var rgb_max = max(...rgb);
        var intensity_cutoff = 1.0 + 0.5 / 255.0;
        if (rgb_max > intensity_cutoff) {
            var scaling = intensity_cutoff / rgb_max;
            rgb = rgb.map(x => x * scaling);
            var clipped_intensity = true;
        }
        for (var index = 0; index < 3; index++) {
            rgb[index] = display_from_linear_component(rgb[index]);
        }
        var ir = round(255.0 * rgb[0]);
        var ig = round(255.0 * rgb[1]);
        var ib = round(255.0 * rgb[2]);
        var ir = min(255, max(0, ir));
        var ig = min(255, max(0, ig));
        var ib = min(255, max(0, ib));
        var irgb = irgb_color(ir, ig, ib);
        // return tuple ([irgb, tuple ([clipped_chromaticity, clipped_intensity])]);
        return [irgb, [clipped_chromaticity, clipped_intensity]];
    };
    /**/ function _twoplaces(n) {
        let c = '' + n;
        if (c.length == 1) {
            return '0' + c;
        }
        return c;
    }
    /**/ var irgb_string_from_irgb = function (irgb) {
        for (var index = 0; index < 3; index++) {
            irgb[index] = min(255, max(0, irgb[index]));
        }
        var irgb_string = `#${_twoplaces(irgb[0])}${_twoplaces(irgb[1])}${_twoplaces(irgb[2])}`;
        // __mod__ ('#%02X%02X%02X', tuple ([irgb [0], irgb [1], irgb [2]]));
        return irgb_string;
    };
    /**/ var irgb_from_irgb_string = function (irgb_string) {
        var strlen = len(irgb_string);
        if (strlen != 7) {
            throw " ValueError ('irgb_string_from_irgb(): Expecting 7 character string like #AB13D2')";
            // __except0__.__cause__ = null;
            // throw __except0__;
        }
        if (irgb_string[0] != '#') {
            throw "ValueError ('irgb_string_from_irgb(): Expecting 7 character string like #AB13D2')";
            // __except0__.__cause__ = null;
            // throw __except0__;
        }
        // var irs = irgb_string.__getslice__ (1, 3, 1);
        var irs = irgb_string.slice(1, 3);
        // var igs = irgb_string.__getslice__ (3, 5, 1);
        var igs = irgb_string.slice(3, 5);
        // var ibs = irgb_string.__getslice__ (5, 7, 1);
        var ibs = irgb_string.slice(5, 7);
        var ir = parseInt(irs, 16);
        var ig = parseInt(igs, 16);
        var ib = parseInt(ibs, 16);
        var irgb = irgb_color(ir, ig, ib);
        return irgb;
    };
    /**/ var irgb_from_rgb = function (rgb) {
        var result = clip_rgb_color(rgb);
        var __left0__ = result;
        var irgb = __left0__[0];
        var clipped_chrom = __left0__[1][0];
        var clipped_int = __left0__[1][1];
        return irgb;
    };
    /**/ var rgb_from_irgb = function (irgb) {
        var r0 = irgb[0] / 255.0;
        var g0 = irgb[1] / 255.0;
        var b0 = irgb[2] / 255.0;
        var r = linear_from_display_component(r0);
        var g = linear_from_display_component(g0);
        var b = linear_from_display_component(b0);
        var rgb = rgb_color(r, g, b);
        return rgb;
    };
    /**/ var irgb_string_from_rgb = function (rgb) {
        return irgb_string_from_irgb(irgb_from_rgb(rgb));
    };
    /**/ irgb_from_xyz = function (xyz) {
        return irgb_from_rgb(rgb_from_xyz(xyz));
    };
    /**/ var irgb_string_from_xyz = function (xyz) {
        return irgb_string_from_rgb(rgb_from_xyz(xyz));
    };
    init();
    // sourceMappingURL=colormodels.map
    // what
    // return [irgb_from_xyz, rgb_from_xyz, xyz_color];
}();
//  as [(xyz: num[]) => number[], (xyz: num[]) => number[], (x: num, y: num, z?: number | undefined) => number[]]; 
// tuples don't work correctly ;-;
function rgb_from_spectrum(sp) {
    return irgb_from_xyz(xyz_from_spectrum(sp));
}
