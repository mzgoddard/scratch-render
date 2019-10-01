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
    return await chromeless.evaluate(function () {return test_1();});
});

chromelessTest('2: new Image, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_2();});
});

chromelessTest('3: new Image, HTMLCanvasElement, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_3();});
});

chromelessTest('4: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_4();});
});

chromelessTest('5: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_5();});
});

chromelessTest('6: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(17);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_6();});
});

chromelessTest('7: RenderWebGL tests: 22 asserts: 17', async function (t, chromeless) {
    t.plan(17);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_7();});
});

chromelessTest('8: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_8();});
});

chromelessTest('9: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(24);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_9();});
});

chromelessTest('10: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_10();});
});

chromelessTest('11: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(24);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_11();});
});

chromelessTest('12: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(25);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_12();});
});

chromelessTest('13: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_13();});
});

chromelessTest('14: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_14();});
});

chromelessTest('15: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_15();});
});

chromelessTest('16: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(17);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_16();});
});

chromelessTest('17: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_17();});
});

chromelessTest('18: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_18();});
});

chromelessTest('19: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_19();});
});

chromelessTest('20: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_20();});
});

chromelessTest('21: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_21();});
});

chromelessTest('22: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_22();});
});

chromelessTest('23: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_23();});
});

chromelessTest('24: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_24();});
});

chromelessTest('25: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_25();});
});

chromelessTest('26: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_26();});
});

chromelessTest('27: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_27();});
});

chromelessTest('28: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_28();});
});

chromelessTest('29: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(32);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_29();});
});

chromelessTest('30: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_30();});
});

chromelessTest('31: createImageBitmap, createBitmapSkin(orange50x50.png), createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_31();});
});

chromelessTest('32: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_32();});
});

chromelessTest('33: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_33();});
});

chromelessTest('34: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_34();});
});

chromelessTest('35: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_35();});
});

chromelessTest('36: createSVGSkin(orange50x50.svg), createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(30);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_36();});
});

chromelessTest('37: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_37();});
});

chromelessTest('38: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_38();});
});

chromelessTest('39: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_39();});
});

chromelessTest('40: createTextBubbleSkin(say, Hello World!, true), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(30);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_40();});
});

chromelessTest('41: createTextBubbleSkin(say, Hello World!, true), createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_41();});
});

chromelessTest('42: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(35);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_42();});
});

chromelessTest('43: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(36);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_43();});
});

chromelessTest('44: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(32);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_44();});
});

chromelessTest('45: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(36);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_45();});
});

chromelessTest('46: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(37);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_46();});
});

chromelessTest('47: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_47();});
});

chromelessTest('48: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(32);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_48();});
});

chromelessTest('49: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_49();});
});

chromelessTest('50: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_50();});
});

chromelessTest('51: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(36);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_51();});
});

chromelessTest('52: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(37);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_52();});
});

chromelessTest('53: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_53();});
});

chromelessTest('54: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(37);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_54();});
});

chromelessTest('55: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(38);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_55();});
});

chromelessTest('56: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_56();});
});

chromelessTest('57: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_57();});
});

chromelessTest('58: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_58();});
});

chromelessTest('59: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(30);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_59();});
});

chromelessTest('60: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(32);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_60();});
});

chromelessTest('61: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_61();});
});

chromelessTest('62: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_62();});
});

chromelessTest('63: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(33);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_63();});
});

chromelessTest('64: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(34);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_64();});
});

chromelessTest('65: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(30);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_65();});
});

chromelessTest('66: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(29);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_66();});
});

chromelessTest('67: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(30);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_67();});
});

chromelessTest('68: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(26);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_68();});
});

chromelessTest('69: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_69();});
});

chromelessTest('70: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_70();});
});

chromelessTest('71: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_71();});
});

chromelessTest('72: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_72();});
});

chromelessTest('73: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_73();});
});

chromelessTest('74: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_74();});
});

chromelessTest('75: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_75();});
});

chromelessTest('76: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_76();});
});

chromelessTest('77: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_77();});
});

chromelessTest('78: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_78();});
});

chromelessTest('79: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_79();});
});

chromelessTest('80: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_80();});
});

chromelessTest('81: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_81();});
});

chromelessTest('82: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_82();});
});

chromelessTest('83: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_83();});
});

chromelessTest('84: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_84();});
});

chromelessTest('85: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_85();});
});

chromelessTest('86: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_86();});
});

chromelessTest('87: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_87();});
});

chromelessTest('88: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_88();});
});

chromelessTest('89: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_89();});
});

chromelessTest('90: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_90();});
});

chromelessTest('91: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_91();});
});

chromelessTest('92: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_92();});
});

chromelessTest('93: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_93();});
});

chromelessTest('94: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_94();});
});

chromelessTest('95: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_95();});
});

chromelessTest('96: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_96();});
});

chromelessTest('97: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_97();});
});

chromelessTest('98: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_98();});
});

chromelessTest('99: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_99();});
});

chromelessTest('100: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_100();});
});

chromelessTest('101: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_101();});
});

chromelessTest('102: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_102();});
});

chromelessTest('103: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_103();});
});

chromelessTest('104: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_104();});
});

chromelessTest('105: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_105();});
});

chromelessTest('106: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_106();});
});

chromelessTest('107: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_107();});
});

chromelessTest('108: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_108();});
});

chromelessTest('109: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_109();});
});

chromelessTest('110: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_110();});
});

chromelessTest('111: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_111();});
});

chromelessTest('112: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_112();});
});

chromelessTest('113: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_113();});
});

chromelessTest('114: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_114();});
});

chromelessTest('115: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_115();});
});

chromelessTest('116: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_116();});
});

chromelessTest('117: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_117();});
});

chromelessTest('118: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_118();});
});

chromelessTest('119: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_119();});
});

chromelessTest('120: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_120();});
});

chromelessTest('121: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_121();});
});

chromelessTest('122: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_122();});
});

chromelessTest('123: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_123();});
});

chromelessTest('124: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_124();});
});

chromelessTest('125: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_125();});
});

chromelessTest('126: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_126();});
});

chromelessTest('127: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_127();});
});

chromelessTest('128: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_128();});
});

chromelessTest('129: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_129();});
});

chromelessTest('130: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_130();});
});

chromelessTest('131: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_131();});
});

chromelessTest('132: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_132();});
});

chromelessTest('133: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_133();});
});

chromelessTest('134: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(19);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_134();});
});

chromelessTest('135: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_135();});
});

chromelessTest('136: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_136();});
});

chromelessTest('137: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_137();});
});

chromelessTest('138: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_138();});
});

chromelessTest('139: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_139();});
});

chromelessTest('140: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_140();});
});

chromelessTest('141: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_141();});
});

chromelessTest('142: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_142();});
});

chromelessTest('143: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_143();});
});

chromelessTest('144: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_144();});
});

chromelessTest('145: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_145();});
});

chromelessTest('146: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_146();});
});

chromelessTest('147: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_147();});
});

chromelessTest('148: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_148();});
});

chromelessTest('149: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_149();});
});

chromelessTest('150: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_150();});
});

chromelessTest('151: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_151();});
});

chromelessTest('152: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_152();});
});

chromelessTest('153: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_153();});
});

chromelessTest('154: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_154();});
});

chromelessTest('155: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_155();});
});

chromelessTest('156: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_156();});
});

chromelessTest('157: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_157();});
});

chromelessTest('158: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_158();});
});

chromelessTest('159: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_159();});
});

chromelessTest('160: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_160();});
});

chromelessTest('161: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_161();});
});

chromelessTest('162: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_162();});
});

chromelessTest('163: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_163();});
});

chromelessTest('164: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_164();});
});

chromelessTest('165: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_165();});
});

chromelessTest('166: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(23);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_166();});
});

chromelessTest('167: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(24);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_167();});
});

chromelessTest('168: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(24);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_168();});
});

chromelessTest('169: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_169();});
});

chromelessTest('170: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_170();});
});

chromelessTest('171: RenderWebGL tests: 26 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_171();});
});

chromelessTest('172: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    await chromeless.evaluate(load, '/test/unit/RenderWebGL.methods.js');
    return await chromeless.evaluate(function () {return test_172();});
});
