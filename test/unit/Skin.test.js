const chromelessTest = require('../fixtures/chromeless-tape');

function load (methods) {
    if (document.querySelector('.methods')) return;
    const script = document.createElement('script');
    return new Promise(resolve => {
        script.onload = function () {
            script.classList.add('methods');
            resolve();
        };
        script.src = methods;
        document.body.appendChild(script);
    });
}

chromelessTest('1: new Skin', async function (t, chromeless) {
    t.plan(10);
    await chromeless.evaluate(load, '/test/unit/Skin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_1();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('2: new Skin, dispose', async function (t, chromeless) {
    t.plan(12);
    await chromeless.evaluate(load, '/test/unit/Skin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_2();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});
