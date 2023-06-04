type num = number;
type tup = Array<number>;
type tup3 = [num, num, num];
type bool = boolean;

type JsonChemical = { state: string };


let __ = undefined;
let lastClickedObject = undefined;

function assert(condition: any, message?: any, hard = true) {
    if (!condition) {
        if (hard) throw new Error(message || "Assertion failed");
        else console.log(message || "Assertion failed :(")
    }
    return condition;
}


class CollisionFilters {
    group = 0;
    category; // 2^0
    mask; // 4294967293
    // all 0b111...1101 except category 2
    constructor(category: num, mask: num, group = 0) {
        if (group) this.group = group;
        if (category) this.category = category;
        if (mask) this.mask = mask;
    }
    static readonly SOLID = new CollisionFilters(1, 0xFFFFFFFF);
    static readonly MOUSE = new CollisionFilters(2, 0xFFFFFFFF);
    static readonly WALL = new CollisionFilters(4, 0xFFFFFFFF);
    static readonly BEAKER = new CollisionFilters(8, 0xFFFFFFFF);
    static readonly GASLIKE = new CollisionFilters(16, 2 + 4 + 8); // only collide with walls, beakers, and the mouse constraint (allow it to be draggable)
    static readonly BEAKER_PHANTOM = new CollisionFilters(32, 2 + 4 + 8); // this is a phantom object that acts as the glass screen of the beaker, but can't be interacted with by a mouse
    static readonly BACKGROUND_GAS = new CollisionFilters(16, 2 + 4); // only collide with walls, beakers, and the mouse constraint (allow it to be draggable)


}
enum ScreenState {
    PAUSED, RUNNING, CREDITS
}



function getCanvas(): HTMLCanvasElement {
    let canvas = document.getElementById("canvas");

    if (canvas && canvas instanceof HTMLCanvasElement) {
        return canvas;
    } else {
        throw new TypeError("Canvas doesn't exist?");
    }
}
function getCanvasContext(canvas?: HTMLCanvasElement): CanvasRenderingContext2D {
    if (!canvas) {
        canvas = getCanvas();
    }
    let ctxt = canvas.getContext("2d");
    if (ctxt === null) throw new TypeError("Context is null?");
    return ctxt;
}

function eventDispatch(eventName: string, eventInfo: any, extraSubcribers = '') {
    let subscribers = $('.subscribed, .inspector ' + extraSubcribers);
    subscribers.trigger(eventName, eventInfo);
}

class Constants {
    static R = 8.31446261815324; // (J)/(K-mol) = 
    static Ratm = 0.082057366080960; // (L-atm)/(K-mol)
    static SIprefs = ['n', 'µ', 'm', 'c', 'd', '', 'k'];
    static SIprefscoeffs = [1e-9, 1e-6, 1e-3, 1e-2, 1e-1, 1, 1e3];
}

type StateEnum = 's' | 'l' | 'g' | 'aq' | "";