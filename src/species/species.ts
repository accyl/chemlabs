import { Vector } from "matter-js";
import { PhysicsHook, newPhysicsHook } from "../phys";
import Matter from "matter-js";
import { ChemComponent } from "../substance";

interface Species extends PhysicsHook {}

function newSpecies(arg1: Matter.Body | Vector, size: Vector, subst: ChemComponent ) {
    let hook = newPhysicsHook(arg1, size, subst);
}

