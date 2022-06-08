"use strict";
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
$('#einspector').on('matterCreated', function (e, eventInfo) {
    // originates from phys() in phys.ts
    // alert('(notifier1)The value of eventInfo is: ' + eventInfo);
    console.log('observed creation of ' + eventInfo['matter'].toString());
});
$('#einspector').on('substanceCreated', function (e, eventInfo) {
    // originates from tang() in physvis.ts, which itself calls phys() but also adds it to glob.s
    let subs = eventInfo['substance'];
    console.log('observed appendage of ' + subs.toString() + ' to the glob');
    let globule = document.createElement('div');
    globule.classList.add('globule');
    globule.textContent = subs.physhook.label;
    $('#einspector')[0].append(globule);
});
