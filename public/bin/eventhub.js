"use strict";
function W_dispatch(eventName, eventInfo, extraSubcribers = '') {
    let subscribers = $('.subscribed, .inspector ' + extraSubcribers);
    subscribers.trigger(eventName, eventInfo);
}
(() => {
    // const myEvent = new CustomEvent('build', { detail: {yolo: 'yes'} });
    // // Listen for the event.
    // elem.addEventListener('build', function (e) { /* ... */ }, false);
    // // Dispatch the event.
    // elem.dispatchEvent(event);
    $(document).on('testEvent', function (e, eventInfo) {
        W_dispatch('substanceCreated', eventInfo);
    });
    $('#einspector').on('substanceCreated', function (e, eventInfo) {
        alert('(notifier1)The value of eventInfo is: ' + eventInfo);
    });
})();
