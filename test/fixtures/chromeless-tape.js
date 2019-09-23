const path = require('path');

const {test, teardown} = require('tap');

const {Chromeless} = require('chromeless');

const indexHTML = path.join(__dirname, 'chromeless-tape.html');

let chromeless;

chromeless = new Chromeless();
teardown(async function () {
    console.log('TEARDOWN');
    try {
        await chromeless.end();
    } catch (e) {
        console.error(e);
    }
    console.log("DONE");
}, 5000);

module.exports = function (name, func) {
    if (typeof name === 'function') {
        func = name;
        name = func.name;
    }
    test(name, async function (t) {
        if (!chromeless) {

        }
        console.log(indexHTML);
        await chromeless.goto(`file://${indexHTML}`)
            .wait('.loaded');
        // await chromeless.evaluate(function () {return 'evaled';});
        console.log('HELLO');
        try {
            await func(t, chromeless);
        } catch (e) {
            console.error(e);
        }
        console.log('GOTO ABOUT:BLANK')
        await chromeless.goto(`about:blank`);
        console.log('AFTER FUNC');
        t.end();
    });
};
