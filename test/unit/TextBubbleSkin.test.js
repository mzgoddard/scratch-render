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
    return await chromeless.evaluate(function () {return test_1();});
});

chromelessTest('2: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), dispose', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_2();});
});

chromelessTest('3: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_3();});
});

chromelessTest('4: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_4();});
});

chromelessTest('5: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_5();});
});

chromelessTest('6: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_6();});
});

chromelessTest('7: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_7();});
});

chromelessTest('8: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_8();});
});

chromelessTest('9: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_9();});
});

chromelessTest('10: new TextBubbleSkin, setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_10();});
});

chromelessTest('11: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_11();});
});

chromelessTest('12: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_12();});
});

chromelessTest('13: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_13();});
});

chromelessTest('14: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_14();});
});

chromelessTest('15: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_15();});
});

chromelessTest('16: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_16();});
});

chromelessTest('17: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_17();});
});

chromelessTest('18: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_18();});
});

chromelessTest('19: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_19();});
});

chromelessTest('20: new TextBubbleSkin, setTextBubble(say, Hello World!, true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_20();});
});

chromelessTest('21: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_21();});
});

chromelessTest('22: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_22();});
});

chromelessTest('23: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_23();});
});

chromelessTest('24: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_24();});
});

chromelessTest('25: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_25();});
});

chromelessTest('26: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_26();});
});

chromelessTest('27: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_27();});
});

chromelessTest('28: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_28();});
});

chromelessTest('29: new TextBubbleSkin, setTextBubble(think, Hello World!, true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_29();});
});

chromelessTest('30: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_30();});
});

chromelessTest('31: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_31();});
});

chromelessTest('32: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_32();});
});

chromelessTest('33: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_33();});
});

chromelessTest('34: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_34();});
});

chromelessTest('35: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_35();});
});

chromelessTest('36: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_36();});
});

chromelessTest('37: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_37();});
});

chromelessTest('38: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_38();});
});

chromelessTest('39: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_39();});
});

chromelessTest('40: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_40();});
});

chromelessTest('41: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_41();});
});

chromelessTest('42: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_42();});
});

chromelessTest('43: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_43();});
});

chromelessTest('44: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_44();});
});

chromelessTest('45: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_45();});
});

chromelessTest('46: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_46();});
});

chromelessTest('47: new TextBubbleSkin, setTextBubble(say, Hello World!, false), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_47();});
});

chromelessTest('48: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_48();});
});

chromelessTest('49: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_49();});
});

chromelessTest('50: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_50();});
});

chromelessTest('51: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_51();});
});

chromelessTest('52: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_52();});
});

chromelessTest('53: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_53();});
});

chromelessTest('54: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_54();});
});

chromelessTest('55: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_55();});
});

chromelessTest('56: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., false), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_56();});
});

chromelessTest('57: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_57();});
});

chromelessTest('58: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_58();});
});

chromelessTest('59: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_59();});
});

chromelessTest('60: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_60();});
});

chromelessTest('61: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_61();});
});

chromelessTest('62: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_62();});
});

chromelessTest('63: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_63();});
});

chromelessTest('64: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_64();});
});

chromelessTest('65: new TextBubbleSkin, setTextBubble(say, Hello\nWorld!, true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_65();});
});

chromelessTest('66: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_66();});
});

chromelessTest('67: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_67();});
});

chromelessTest('68: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_68();});
});

chromelessTest('69: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_69();});
});

chromelessTest('70: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_70();});
});

chromelessTest('71: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_71();});
});

chromelessTest('72: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_72();});
});

chromelessTest('73: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_73();});
});

chromelessTest('74: new TextBubbleSkin, setTextBubble(say, Lorem ipsum dolor si..., true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_74();});
});

chromelessTest('75: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_75();});
});

chromelessTest('76: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_76();});
});

chromelessTest('77: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_77();});
});

chromelessTest('78: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_78();});
});

chromelessTest('79: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_79();});
});

chromelessTest('80: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_80();});
});

chromelessTest('81: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_81();});
});

chromelessTest('82: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_82();});
});

chromelessTest('83: new TextBubbleSkin, setTextBubble(say, , true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_83();});
});

chromelessTest('84: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_84();});
});

chromelessTest('85: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(think, Hello World!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_85();});
});

chromelessTest('86: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_86();});
});

chromelessTest('87: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Hello World!, false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_87();});
});

chromelessTest('88: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., false), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_88();});
});

chromelessTest('89: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Hello\nWorld!, true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_89();});
});

chromelessTest('90: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, Lorem ipsum dolor si..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_90();});
});

chromelessTest('91: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, , true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_91();});
});

chromelessTest('92: new TextBubbleSkin, setTextBubble(say, pneumonoultramicrosc..., true), getTexture(), setTextBubble(say, pneumonoultramicrosc..., true), getTexture()', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/TextBubbleSkin.methods.js');
    return await chromeless.evaluate(function () {return test_92();});
});
