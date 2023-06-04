/*
<!-- <script>var exports = {};</script> -->
        <!-- <script src="https://unpkg.com/lodash@4.17.20"></script> -->
        <!-- <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script> -->
        <script src="libs/jquery-3.6.0.min.js"></script>

        <!-- <script src="https://cdn.jsdelivr.net/npm/nerdamer@1.1.13/all.min.js"></script> -->
        <!-- <script src="libs/nerdamer.min.js"></script> -->
        <!--this is the source of the lag-->
        <!-- <script src="data/ptabledata.js"></script> -->
        <script src="bin/first.js"></script>


        <script src="bin/data/ptable.js"></script>
        <script src="bin/cheminfoproxy.js"></script>


        <script src="bin/command.js"></script>
        <script src="bin/tungstenfunction.js"></script>

        <!-- <script src="bin/equations.js"></script> -->


        <script src="libs/matter.min.js"></script>

        <!-- <script src="raw/tut.matter.js"></script> -->
        <script src="bin/beaker.js"></script>

        <script src="bin/matterjsobjects.js"></script>

        <script src="bin/color/color.js"></script>
        <script src="bin/color/colortest.js"></script>
        <script src="bin/color/colormodels.js"></script>
        <!--push it to the front because chemicals.ts needs colormodels.js-->

        <!-- <script src="bin/physold.js"></script> -->
        <script src="bin/phys.js"></script>

        <script src="bin/substance.js"></script>
        <script src="bin/chemicals.js"></script>
        <script src="bin/physvis.js"></script>

        <script src="bin/dom/inspector.js"></script>




        <!-- <script src="bin/command.js"></script> -->

        <script src="bin/dom/load.js"></script>
        <script src="raw/load.js"></script>
        */



/*
//         <script src="libs/jquery-3.6.0.min.js"></script>
// first
// ptable
// cheminfoproxy
// command
// tungstenfunction
// matterjs
// beaker
// matterjsobjects
// color, colortest, colormodels
// phys
// substance
// chemicals
// physvis
// inspector
// load
// raw/load
*/

// import { chemicalsMain } from "./chemicals";
import { loadMain } from "./dom/load";
import { firstMain } from "./first";
import { matterjsobjectsMain } from "./matterjsobjects";
import { physvisMain } from "./physvis";
import { init as colorInit} from "./color/color";
import { init as colorModelsInit} from "./color/colormodels";
import { inspectorInit } from "./dom/inspector";

firstMain();
matterjsobjectsMain();
colorInit();
colorModelsInit();

// phys, substance stateless
// chemicalsMain();
physvisMain();
inspectorInit();
loadMain();

// this is a SO-approved way to make module stuffs available to global:
// https://stackoverflow.com/a/56738910/6844235
console.log('load resolver...');
import * as resolver from "./data/resolver";
(window as any).Resolver = resolver;