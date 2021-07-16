"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.len = exports.round = exports.min = exports.max = exports.int = void 0;
// selected python polyfill from org.transcrypt.__runtime__.js
function int(number) {
    return number > 0
        ? Math.floor(number)
        : Math.ceil(number);
}
exports.int = int;
function max() {
    var nums = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        nums[_i] = arguments[_i];
    }
    // return arguments.length == 1 ? Math.max(...nrOrSeq) : Math.max(...arguments);
    return Math.max.apply(Math, nums);
}
exports.max = max;
;
function min() {
    var nums = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        nums[_i] = arguments[_i];
    }
    // return arguments.length == 1 ? Math.min(...nrOrSeq) : Math.min(...arguments);
    return Math.min.apply(Math, nums);
}
exports.min = min;
;
function round(num) {
    // return arguments.length == 1 ? Math.min(...nrOrSeq) : Math.min(...arguments);
    return Math.round(num);
}
exports.round = round;
;
function len(obj) {
    if (obj === undefined || obj === null) {
        return 0;
    }
    // if (obj.__len__ instanceof Function) {
    // return obj.__len__();
    // }
    return obj.length;
    // if (obj.length !== undefined) {
    // return obj.length;
    // }
    // var length = 0;
    // for (var attr in obj) {
    // if (!__specialattrib__(attr)) {
    // length++;
    // }
    // }
    // return length;
}
exports.len = len;
;
// export function float(number: num) {
//     if (any == 'inf') {
//         return Infinity;
//     }
//     else if (any == '-inf') {
//         return -Infinity;
//     }
//     else if (any == 'nan') {
//         return NaN;
//     }
//     else if (isNaN(parseFloat(any))) {
//         if (any === false) {
//             return 0;
//         }
//         else if (any === true) {
//             return 1;
//         }
//         else {
//             throw ValueError("could not convert string to float: '" + str(any) + "'", new Error());
//         }
//     }
//     else {
//         return +any;
//     }
// }
