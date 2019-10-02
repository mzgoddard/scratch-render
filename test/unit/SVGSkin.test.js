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

chromelessTest('1: new SVGSkin, dispose', async function (t, chromeless) {
    t.plan(16);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_1();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('2: new SVGSkin, setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), dispose', async function (t, chromeless) {
    t.plan(27);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_2();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('3: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), dispose', async function (t, chromeless) {
    t.plan(27);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_3();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('4: new SVGSkin, setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_4();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('5: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_5();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('6: new SVGSkin, setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_6();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('7: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_7();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('8: new SVGSkin, setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_8();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('9: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_9();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('10: new SVGSkin, setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_10();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('11: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_11();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('12: new SVGSkin, setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_12();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('13: new SVGSkin, setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_13();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('14: new SVGSkin, setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_14();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('15: new SVGSkin, setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_15();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('16: new SVGSkin, setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_16();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('17: new SVGSkin, setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_17();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('18: new SVGSkin, setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_18();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('19: new SVGSkin, setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_19();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('20: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_20();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('21: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_21();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('22: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_22();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('23: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_23();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('24: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_24();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('25: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_25();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('26: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_26();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('27: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_27();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('28: new SVGSkin, setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_28();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('29: new SVGSkin, setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_29();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('30: new SVGSkin, setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_30();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('31: new SVGSkin, setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_31();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('32: new SVGSkin, setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_32();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('33: new SVGSkin, setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_33();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('34: new SVGSkin, setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_34();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('35: new SVGSkin, setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_35();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('36: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_36();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('37: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_37();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('38: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_38();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('39: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_39();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('40: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_40();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('41: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_41();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('42: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_42();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('43: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_43();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('44: new SVGSkin, setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_44();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('45: new SVGSkin, setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_45();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('46: new SVGSkin, setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_46();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('47: new SVGSkin, setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_47();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('48: new SVGSkin, setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_48();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('49: new SVGSkin, setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_49();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('50: new SVGSkin, setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_50();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('51: new SVGSkin, setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_51();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('52: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_52();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('53: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_53();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('54: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_54();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('55: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_55();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('56: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_56();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('57: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_57();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('58: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_58();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('59: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_59();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('60: new SVGSkin, setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_60();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('61: new SVGSkin, setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_61();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('62: new SVGSkin, setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_62();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('63: new SVGSkin, setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_63();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('64: new SVGSkin, setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_64();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('65: new SVGSkin, setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_65();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('66: new SVGSkin, setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_66();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('67: new SVGSkin, setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_67();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('68: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_68();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('69: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_69();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('70: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_70();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('71: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_71();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('72: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_72();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('73: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_73();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('74: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_74();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('75: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(46);
    await chromeless.evaluate(load, '/test/unit/SVGSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_75();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});
