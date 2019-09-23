const chromelessTest = require('./chromeless-tape');
const {build} = require('./declare-tests');

const buildChromeless = function (state, each, after) {
    const builtTest = new Function (`
        return async function (t, chromeless) {
            t.plan(${state.plan || 1});
            function assert ([fn, ...args]) {
                if (t[fn]) t[fn](...args);
            }
            async function scope (t, f) {
                try {
                    return ((await f()) || []).map(assert);
                } catch (e) {
                    console.error(e);
                }
            }
            ${state.tests
                .map(test => `await scope(t, async function () {
                    return await chromeless.evaluate(function () {
                        return ${test.toString()}(window.context = window.context || {});
                    });
                });`)
                .join('\n')}
        };
    `)();
    console.log(builtTest.toString());
    chromelessTest(builtTest);
    return each({...state, builtTest}, after);
};

module.exports = {
    buildChromeless
};
