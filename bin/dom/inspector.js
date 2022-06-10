"use strict";
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
$('#einspector').on('matterCreated', function (e, eventInfo) {
    // originates from phys() in phys.ts
    // alert('(notifier1)The value of eventInfo is: ' + eventInfo);
    console.log('observed creation of ' + eventInfo['matter'].toString());
});
// TODO
// since we are given mixin creation functions for each phase, we can reflexively discover the attributes that each subclass of substance creates
// so we can show them in the inspector
function showSubstanceAttributes(subs) {
    let subs2 = subs;
    // subs2.type.
    let attrs = ['mass', 'volume', 'temperature', 'state', 'mol', 'molarMass'];
    let s = '\n';
    for (let attr of attrs) {
        if (attr in subs) {
            let result = subs[attr];
            s += `${attr}: ${subs[attr]}\n`;
        }
    }
    return s;
}
function allKeys(obj) {
    const getters = Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(obj)))
        .filter(([key, descriptor]) => typeof descriptor.get === 'function')
        .map(([key]) => key);
    const protos = Object.keys(Object.getPrototypeOf(obj));
    return Array.from(new Set(Object.keys(obj).concat(getters, protos)));
}
function allNewAttributes(newer, older) {
    let obj = new older();
    let oldattr = allKeys(obj);
    // let newobj = new ((newer.bind)(obj))();
    //newer.apply(obj);
    // let newobj = obj;
    let newobj = new newer();
    let newattr = allKeys(newobj);
    let diff = newattr.filter(x => !oldattr.includes(x)); // remove old attributes from the new to get only the new
    return diff;
}
$('#einspector').on('substanceCreated', function (e, eventInfo) {
    // originates from tang() in physvis.ts, which itself calls phys() but also adds it to glob.s
    let subs = eventInfo['substance'];
    console.log('observed appendage of ' + subs.toString() + ' to the glob');
    let globule = document.createElement('div');
    globule.classList.add('globule');
    globule.textContent = subs.physhook.label;
    $('#einspector')[0].append(globule);
    let createInfobox = document.createElement('code');
    createInfobox.classList.add('substance-attributes');
    createInfobox.textContent = showSubstanceAttributes(subs);
    $(createInfobox).hide();
    let $globule = $(globule);
    $globule.append(createInfobox);
    // when clicked, show the substance's properties
    $globule.on('click', function () {
        // expand the div
        $globule.toggleClass('expanded');
        if ($globule.hasClass('expanded')) {
            let $infobox = $globule.children('code.substance-attributes');
            $infobox.text(showSubstanceAttributes(subs)); // update
            $infobox.show();
        }
        else {
            $globule.children('code.substance-attributes').hide();
        }
        // show the substance's properties
    });
});
$('#einspector').on('substanceUpdated', function (e, eventInfo) {
    let subs = eventInfo['substance'];
});
