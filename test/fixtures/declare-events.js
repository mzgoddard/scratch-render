const willEmitEvent = function (event) {
    return add({
        test: [function (context) {
            context.event = context.event || {};
            context.event[event] = {
                called: false,
                call: []
            };
            context.value.on(event, function (...args) {
                context.event[event].called = true;
                context.event[event].call.push(args);
            });
        }]
    });
};

module.exports = {
    willEmitEvent
};
