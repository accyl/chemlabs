// selected python polyfill from org.transcrypt.__runtime__.js
export function int(number: num) {
    return number > 0
        ? Math.floor(number)
        : Math.ceil(number);
}

export function max(...nums: num[]) {
    // return arguments.length == 1 ? Math.max(...nrOrSeq) : Math.max(...arguments);
    return Math.max(...nums);
};
export function min(...nums: num[]) {
    // return arguments.length == 1 ? Math.min(...nrOrSeq) : Math.min(...arguments);
    return Math.min(...nums);
};
export function round(num: num) {
    // return arguments.length == 1 ? Math.min(...nrOrSeq) : Math.min(...arguments);
    return Math.round(num);
};
export function len(obj?: Array<any> | string) {
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
};
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