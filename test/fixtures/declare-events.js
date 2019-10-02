const {state, fail, every, hasProperties, evaluate, call, some, pass} = require('./declare-tests');

const eventsMembers = hasProperties(['on', 'off']);

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
    return evaluate({
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
    return evaluate({
        plan: 1,
        test: [didEmitEventTest, event]
    });
};

module.exports = {
    eventsMembers,
    willEmitEvent,
    didEmitEvent
};
