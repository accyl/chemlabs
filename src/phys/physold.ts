/// <reference path='../math.ts'/>



class Locatable extends GeneralizedFunction {
    _zeroes() {
        return [0, 0, 0];
    }
    static NONE = function() {
        let retn=  new Locatable();
        retn._x0 = [0, 0, 0];
        retn.step = function(a, b) {};
        retn.eulers = function(a, b, c) {};
        return retn;
    }();

}





class PhysicsHook { //implements PhysicsHookCommon{
    private loc: Locatable;
    xsize: num = 10;
    ysize: num = 10;
    zsize: num = 10;
    constructor(pos?: [num, num, num], size?: [num, num, num]) {
        this.loc = pos ? new Locatable(pos) : Locatable.NONE;
        if (size) {
            this.xsize = size[0];
            this.ysize = size[1];
            this.zsize = size[2];

        }
    }
    set pos(position: [num, num, num]) {
        for(let i=0;i<position.length;i++) {
            let x = position[i];
            if(x === undefined) x = this.loc._x0[i];
        }
        this.loc._x0 = position;
    }
    get pos() {
        return this.loc.pos(0) as [num, num, num];
    }
    set vel(velocity: [num, num, num]) {
        for (let i = 0; i < velocity.length; i++) {
            let x = velocity[i];
            if (x === undefined) x = this.loc._v0[i];
        }
        this.loc._v0 = velocity;
    }
    get vel() {
        return this.loc.vel(0) as [num, num, num];
    }
    set acc(accel: [num, num, num]) {
        for (let i = 0; i < accel.length; i++) {
            let x = accel[i];
            if (x === undefined) x = this.loc._a0[i];
        }
        this.loc._a0 = accel;
    }
    get acc() {
        return this.loc.acc(0) as [num, num, num];
    }
    get size() {
        return [this.xsize, this.ysize, this.zsize];
    }
    set size(x: tup3) {
        [this.xsize, this.ysize, this.zsize] = x;
    }

}