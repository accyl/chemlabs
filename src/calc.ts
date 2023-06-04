import { field } from "./substance";
export function present(arg: field) {
    return !absent(arg);
}
export function absent(arg: field ) {
    return arg === undefined || arg === null;
}
export function exactlyOneAbsent(...args: field[]) {
    let und = 0;
    let nul = 0;
    for(let arg of args) {
        if(arg === undefined) {
            und++;
        } else if (arg === null) {
            nul++;
        }
    }
    return und + nul === 1;
}
export function allAbsent(...args: field[]) {
    for(let arg of args) {
        if(arg !== undefined && arg !== null) return false;
    }
    return true;
}
export function ifOneAbsent(args: field[], setTos: num[]) {
    let abs = false;
    let absi = -1;
    
    for (let i=0;i<args.length;i++) {
        let arg = args[i];
        if (arg === undefined || arg === null) {
            if(abs === false) {
                abs = true;
                absi = i;
            } else {
                // more than 1 absent
                return args;
            }
        }
    }
    let ret = args; // [...args]; shallow copy is not necessary if we are using [this.mass, this.volume, etc.]
    ret[absi] = setTos[absi];
    return ret;
}
export function forceDefaultsIfAbsent(args: field[], defaults: num[], forceToggles: bool[], ifSomethingAbsent?: () => any) {
    let ret = [];
    let i = 0;
    let flag = false;
    for (let arg of args) {
        if (absent(arg) && forceToggles[i]) {
            ret[i] = defaults[i];
            flag = true;
        } else {
            ret[i] = arg;
        }
        i++;
    }
    if(flag && ifSomethingAbsent) ifSomethingAbsent();
    return ret;
}

export function setMissingFieldsToNull(obj: Record<string, any>, defaul = null, ...fields: string[]) {
    for(let field of fields) {
        if(!('field' in obj)) obj[field] = defaul;
    }
    return obj;
}

export function mergeInto(objInto: Record<string, any>, objFrom: Record<string, any>, ...fields: string[]) {
    for(let field in objFrom) {
        if(fields.includes(field)) {
            // if(field !== undefined && field !== null) {
            objInto[field] = objFrom[field];
            // }
        }
    }
    return objInto;
}