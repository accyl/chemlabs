import 'jquery';
import { AtomTracker, ComputedQty, Tokenizers } from '../command';
import { Components, MolecularSubstance } from '../substances';
import { ChemComponent, ChemType, field } from '../substance';

export type DBResponse = {"_id": string, "prefix": string, "name"?: string, "formula": string, "formula_weight"?: num |string, 
"density"?: num | string, "melting_C"?: num | string, "boiling_C"?: num | string, "solub_100pt_slv"?: string, 
"thermo": {"_id": string, "state": StateEnum, "enthalpy"?: num, "gibbs"?: num, "entropy"?: num, "heat_capacity"?: num}[]};

let formulaCache: Record<string, DBResponse[]> = {};
export function getByFormula(formula?: string): Promise<DBResponse[]> {
    if (!formula) {
        formula = $("#input-new-by-formula").val() as string;
    }
    
    return new Promise((resolve, reject) => {
        if(formula === undefined) {
            // uhh what do we do
            // null op??
            reject("formula was not found (undefined)!");
        } else if (formula in formulaCache) {
            resolve(formulaCache[formula]);
        } else {
            $.ajax({
                url: `http://localhost:3000/api/formula/${encodeURIComponent(formula!)}`,
                success: function (data) {
                    resolve(data);
                    formulaCache[formula!] = data;
                },
                error: function (error) {
                    reject(error);
                } // ,
            // context: document.body
            });
        }
    });
}
let nameCache: Record<string, DBResponse[]> = {};
export function getByName(name?: string): Promise<DBResponse[]> {
    let first, second;
    if (!name) {
        name = $("#input-new-by-name").val() as string;
    }
    if (name.includes(' ')) {
        first = name.substring(0, name.indexOf(' '));
        second = name.substring(name.indexOf(' ') + 1);
    } else {
        first = name;
    }
    let urlpart = `${encodeURIComponent(first)}`;
    if (second) urlpart += `/${encodeURIComponent(second)}`;
    return new Promise((resolve, reject) => {
        if(!urlpart) {
            reject("name was not found (undefined)");
        } else if(urlpart in nameCache) {
            resolve(nameCache[urlpart]);
        } else {
            $.ajax({
                url: `http://localhost:3000/api/fuzzy/${encodeURIComponent(urlpart)}`,
                success: function (data) {
                    resolve(data);
                    nameCache[urlpart] = data;
                },
                error: function (error) {
                    reject(error);
                } // ,
                // context: document.body
            });
        }
    });
}
export function getByWStr(wstr: string) {
}

export function suggestNewByFormula(formula: string, at?: AtomTracker): JQuery.jqXHR<DBResponse[]> {
    return undefined as unknown as any; 
    // TODO unimplemented!
}


// export type DBResponse = {
//     "_id": string, "prefix": string, "name"?: string, "formula": string, "formula_weight"?: num | string,
//     "density"?: num | string, "melting_C"?: num | string, "boiling_C"?: num | string, "solub_100pt_slv"?: string,
//     "thermo": { "_id": string, "state": "g" | "c" | "lq" | "aq", "enthalpy"?: num, "gibbs"?: num, "entropy"?: num, "heat_capacity"?: num }[]
// };

// export type ChemType = {
//     id: string, canonical: string, formula: string, molarMass: num, 
//     density?: num // g/mL
//     // (thermo properties get squashed)
//     state: "g" | "c" | "lq" | "aq", heat_capacity?: num, gibbs?: num, entropy?: num, enthalpy?: num // J/(g-K), 
//     rgb: string; //  = '#FFFFFF'; // [255, 255, 255];
// };


export function toNum(inp: string | number | undefined | null, defaul = NaN) {
    
    let ret;
    if (typeof inp === 'number') {
        ret = inp;
    } else if (!inp) {
        ret = undefined;
    } else {
        ret = parseFloat(inp.replaceAll('(', '').replaceAll(')', '')); // could be NaN
    }
    if (ret === undefined || isNaN(ret)) {
        return defaul;
    }
    return ret;
}
function toNumField(obj: Record<string, any>, fd: string) {
    return fd in obj ? toNum(obj[fd]) : null;
}
export function getType(resp: DBResponse, state: StateEnum) {
    let build = new ChemType();
    build.id = resp._id; build.canonical = resp.prefix + ('name' in resp ? " " + resp.name : '');
    build.formula = resp.formula; 
    build.molarMass = toNumField(resp, 'formula_weight');
    build.density = toNumField(resp, 'density');
    
    let thermo;
    if(state !== '') {
        thermo = resp.thermo.filter(x => x.state === state)[0];
    } else {
        let thermos = resp.thermo;
        if(thermos.length === 1) {
            thermo = thermos[0];
        } else {
            // ahhh what do we do?
            // we pick the standard state
            // TODO
            for(let t of thermos) {
                if('is_std' in t && t.is_std) {
                    thermo = t;
                    break;
                }
            }
            if(thermos.length === 0) {
                thermo = undefined;
            } else if(!thermo) {
                thermo = thermos[0];
            }
        }
    }
    if(!thermo) {
        throw "no thermo data found! (no state is available)";
    }
    build.state = thermo.state;
    build.heat_capacity = toNumField(thermo, 'heat_capacity');
    build.gibbs = toNumField(thermo, 'gibbs');
    build.entropy = toNumField(thermo, 'entropy');
    build.enthalpy = toNumField(thermo, 'enthalpy');
    return build;
}
export async function amount(resp: DBResponse, qty: ComputedQty | string, state: StateEnum): Promise<ChemComponent> {
    // TODO
    let subst;

    if (typeof qty === 'string') {
        qty = Tokenizers.quantityTokenizer(qty)[2].computed();
    }

    let type = getType(resp, state); // we need some way to get the type from the resp
    if (state === 'aq') {
        // TODO water
        let solutes = await getByFormula('H2O');
        subst = Components.Aqueous(type, await amount(solutes[0], '1L', 'l') as MolecularSubstance);
    } else if (state === 'g') {
        subst = Components.Gaseous(type);
    } else if (resp.formula_weight) {
        subst = Components.Molecular(type); // molar mass should be dealt with
    } else if (type) {
        subst = new ChemComponent(type);

    } else {
        return ChemComponent.BOUNDS_ONLY; // TODO unimplemented

    }
    if ('mol' in subst) {
        subst.safeSet({ mass: qty.mass, mol: qty.mol, volume: qty.vol });
    } else {
        subst.safeSet({ mass: qty.mass, volume: qty.vol });
    }
    return Promise.resolve(subst);


}


