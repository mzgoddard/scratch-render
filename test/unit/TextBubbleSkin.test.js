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

chromelessTest('1: new TextBubbleSkin, dispose', async function (t, chromeless) {
    t.plan(16);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_1();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('2: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), dispose', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_2();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('3: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_3();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('4: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_4();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('5: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_5();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('6: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_6();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('7: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_7();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('8: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_8();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('9: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_9();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('10: new TextBubbleSkin, setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_10();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('11: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_11();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('12: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_12();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('13: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_13();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('14: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_14();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('15: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_15();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('16: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_16();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('17: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_17();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('18: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_18();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('19: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_19();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('20: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_20();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('21: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_21();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('22: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_22();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('23: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_23();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('24: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_24();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('25: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_25();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('26: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_26();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('27: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_27();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('28: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_28();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('29: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_29();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('30: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_30();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('31: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_31();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('32: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_32();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('33: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_33();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('34: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_34();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('35: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_35();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('36: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_36();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('37: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_37();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('38: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_38();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('39: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_39();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('40: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_40();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('41: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_41();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('42: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_42();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('43: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_43();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('44: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_44();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('45: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_45();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('46: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_46();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('47: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_47();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('48: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_48();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('49: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_49();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('50: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_50();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('51: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_51();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('52: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_52();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('53: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_53();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('54: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_54();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('55: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_55();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('56: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_56();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('57: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_57();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('58: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_58();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('59: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_59();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('60: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_60();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('61: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_61();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('62: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_62();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('63: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_63();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('64: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_64();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('65: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_65();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('66: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_66();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('67: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_67();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('68: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_68();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('69: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_69();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('70: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_70();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('71: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_71();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('72: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_72();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('73: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_73();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('74: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_74();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('75: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_75();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('76: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_76();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('77: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_77();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('78: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_78();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('79: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_79();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('80: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_80();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('81: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_81();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('82: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_82();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('83: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_83();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('84: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_84();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('85: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_85();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('86: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_86();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('87: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_87();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('88: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_88();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('89: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_89();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('90: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_90();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('91: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_91();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('92: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_92();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});
