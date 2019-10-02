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

chromelessTest('1: RenderWebGL tests: 6 asserts: 4', async function (t, chromeless) {
    t.plan(4);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_1();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('2: new Image, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_2();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('3: new Image, HTMLCanvasElement, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_3();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('4: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_4();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('5: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_5();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('6: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(17);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_6();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('7: RenderWebGL tests: 22 asserts: 17', async function (t, chromeless) {
    t.plan(17);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_7();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('8: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_8();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('9: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(24);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_9();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('10: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_10();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('11: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(24);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_11();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('12: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(25);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_12();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('13: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_13();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('14: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_14();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('15: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_15();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('16: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(17);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_16();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('17: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_17();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('18: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_18();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('19: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_19();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('20: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_20();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('21: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_21();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('22: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_22();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('23: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_23();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('24: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_24();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('25: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_25();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('26: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_26();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('27: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_27();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('28: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_28();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('29: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(32);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_29();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('30: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_30();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('31: createImageBitmap, createBitmapSkin(orange50x50.png), createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_31();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('32: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_32();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('33: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_33();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('34: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_34();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('35: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_35();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('36: createSVGSkin(orange50x50.svg), createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(30);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_36();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('37: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_37();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('38: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_38();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('39: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_39();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('40: createTextBubbleSkin(say, Hello World!, true), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(30);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_40();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('41: createTextBubbleSkin(say, Hello World!, true), createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_41();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('42: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(35);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_42();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('43: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(36);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_43();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('44: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(32);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_44();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('45: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(36);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_45();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('46: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(37);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_46();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('47: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_47();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('48: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(32);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_48();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('49: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_49();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('50: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_50();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('51: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(36);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_51();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('52: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(37);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_52();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('53: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_53();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('54: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(37);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_54();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('55: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(38);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_55();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('56: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_56();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('57: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_57();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('58: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_58();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('59: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(30);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_59();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('60: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(32);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_60();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('61: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_61();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('62: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_62();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('63: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_63();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('64: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_64();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('65: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(30);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_65();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('66: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_66();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('67: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(30);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_67();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('68: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_68();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('69: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_69();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('70: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_70();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('71: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_71();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('72: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_72();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('73: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_73();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('74: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_74();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('75: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_75();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('76: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_76();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('77: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_77();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('78: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_78();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('79: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_79();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('80: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_80();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('81: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_81();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('82: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_82();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('83: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_83();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('84: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_84();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('85: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_85();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('86: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_86();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('87: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_87();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('88: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_88();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('89: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_89();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('90: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_90();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('91: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_91();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('92: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_92();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('93: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_93();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('94: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_94();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('95: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_95();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('96: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_96();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('97: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_97();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('98: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_98();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('99: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_99();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('100: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_100();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('101: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_101();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('102: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_102();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('103: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_103();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('104: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_104();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('105: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_105();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('106: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_106();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('107: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_107();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('108: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_108();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('109: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_109();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('110: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_110();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('111: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_111();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('112: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_112();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('113: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_113();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('114: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_114();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('115: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_115();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('116: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_116();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('117: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_117();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('118: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_118();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('119: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_119();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('120: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_120();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('121: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_121();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('122: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_122();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('123: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_123();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('124: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_124();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('125: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_125();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('126: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_126();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('127: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_127();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('128: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_128();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('129: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_129();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('130: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_130();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('131: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_131();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('132: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_132();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('133: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_133();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('134: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_134();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('135: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_135();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('136: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_136();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('137: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_137();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('138: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_138();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('139: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_139();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('140: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_140();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('141: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_141();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('142: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_142();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('143: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_143();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('144: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_144();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('145: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_145();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('146: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_146();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('147: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_147();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('148: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_148();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('149: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_149();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('150: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_150();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('151: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_151();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('152: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_152();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('153: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_153();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('154: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_154();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('155: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_155();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('156: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_156();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('157: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_157();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('158: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_158();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('159: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_159();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('160: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_160();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('161: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_161();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('162: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_162();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('163: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_163();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('164: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_164();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('165: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_165();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('166: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_166();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('167: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(24);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_167();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('168: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(24);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_168();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('169: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_169();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('170: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_170();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('171: RenderWebGL tests: 26 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_171();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});

chromelessTest('172: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {
        try {
            return test_172();
        } catch (e) {
            return [['fail', e.message || 'threw error', {stack: e.stack}]];
        }
    });
});
