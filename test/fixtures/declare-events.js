const {state, fail, and, get, add, call, or, pass} = require('./declare-tests');

const eventsMembers = and([
    get('on'),
    get('off')
]);

function willEmitEventTest (context, event) {
    context.event = context.event || {};
    context.event[event] = {
        called: false,
        calledPromise: null,
        call: []
    };
    context.event[event].calledPromise = new Promise(function (resolve) {
        context.value.on(event, function (...args) {
            context.event[event].called = true;
            context.event[event].call.push(args);
            resolve(context.event[event]);
        });
    });
};

const willEmitEvent = function (event) {
    return add({
        test: [willEmitEventTest, event]
    });
};

async function didEmitEventTest (context, event) {
    return [
        await Promise.race([
            context.event[event].calledPromise
                .then(({called}) => (['ok', called, `did emit ${event}`])),
            new Promise((resolve) => setTimeout(resolve, 100))
                .then(() => (['fail', 'timeout']))
        ])
    ];
};

const didEmitEvent = function (event) {
    return add({
        plan: 1,
        test: [didEmitEventTest, event]
    });
};

module.exports = {
    eventsMembers,
    willEmitEvent,
    didEmitEvent
};
