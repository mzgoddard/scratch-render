async function call (fn, context, args) {
    return [
        ['comment', `${fn.name}(...${JSON.stringify(args)})`],
        ...((await fn(context, ...args)) || []).map(test => test[test.length - 1].stack ? test : [...test, {stack: new Error(test[test.length - 1]).stack.split('\n').slice(4).join('\n')}])
    ];
}
function loadModuleVarTest (context, name, srcPath) {
    context.module = context.module || {};
    context.module[name] = window.ScratchRenderFiles(srcPath);
    return [['ok', context.module[name], `module ${name} loaded`]];
}
function createCanvas (context) {
    context.canvas = document.createElement('canvas');
    context.canvas.width = 480;
    context.canvas.height = 360;
}
function newRenderWebGL (context) {
    context.renderer = new context.module.RenderWebGL(context.canvas);
}
function valueTest (context, key) {
    context.value = context[key];
    return [['ok', typeof context.value !== 'undefined', 'context.value is set']];
}
function hasPropertyTest (context, key) {
    // Test that this does not throw.
    context.value[key];
    return [['ok', key in context.value, `has ${key} property`]];
}
function skinIdTest (context) {
    context.skinId = Math.random().toString().slice(2);
}
function newTextBubbleSkin (context) {
    context.value = context.skin = new context.module.TextBubbleSkin(context.skinId, context.renderer);
}
function rotationCenterIsArray (context) {
    return [['ok', context.value.rotationCenter.length >= 2, 'rotationCenter is an array']];
}
function dispose (context) {
    context.skin.dispose();
    return [['equal',
            context.skin.id,
            context.module.RenderConstants.ID_NONE,
            'disposed of its id'
    ]];
}
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
}
function createTextBubble (context, textBubble) {
    context.textBubble = textBubble;
    context.imageSize = textBubble.size;
    context.imageRotationCenter = [0, 0];
}
function setTextBubble (context) {
    const {type, text, pointsLeft} = context.textBubble;
    context.skin.setTextBubble(type, text, pointsLeft);
}
function skinSize (context) {
    const {size} = context.skin;
    return [['same',
            [Math.ceil(size[0]), Math.ceil(size[1])],
            context.imageSize,
            'skin.size matches image size'
    ]];
}
async function didEmitEventTest (context, event) {
    return [
        await Promise.race([
            context.event[event].calledPromise
            .then(({called}) => (['ok', called, `did emit ${event}`])),
            new Promise((resolve) => setTimeout(resolve, 100))
            .then(() => (['fail', 'timeout']))
        ])
    ];
}
function skinRotationCenter (context) {
    const {rotationCenter} = context.skin;
    return [['same',
            [Math.ceil(rotationCenter[0]), Math.ceil(rotationCenter[1])],
            context.imageRotationCenter,
            'skin.rotationCenter matches'
    ]];
}
function texture (context, scale) {
    const tex = context.skin.getTexture(scale);
    const uniforms = context.skin.getUniforms(scale);
    return [
        ['ok', tex !== null && typeof tex === 'object', 'returns texture'],
        ['ok', uniforms.u_skin === tex, 'u_skin is texture'],
        ['same', Array.from(uniforms.u_skinSize, Math.ceil), context.imageSize, 'u_skinSize is size']
    ];
}
async function test_1 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(loadModuleVarTest, context, ["RenderConstants","./RenderConstants.js"])),
            ...(await call(dispose, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_2 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(loadModuleVarTest, context, ["RenderConstants","./RenderConstants.js"])),
            ...(await call(dispose, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_3 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_4 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_5 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_6 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_7 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_8 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_9 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_10 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_11 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_12 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_13 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_14 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_15 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_16 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_17 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_18 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_19 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_20 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_21 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_22 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_23 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_24 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_25 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_26 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_27 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_28 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_29 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_30 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_31 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_32 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_33 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_34 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_35 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_36 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_37 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_38 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_39 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_40 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_41 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_42 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_43 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_44 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_45 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_46 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_47 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_48 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_49 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_50 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_51 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_52 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_53 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_54 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_55 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_56 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_57 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_58 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_59 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_60 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_61 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_62 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_63 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_64 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_65 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_66 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_67 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_68 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_69 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_70 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_71 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_72 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_73 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_74 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_75 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_76 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_77 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_78 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_79 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_80 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_81 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_82 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_83 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_84 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_85 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"think","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_86 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":true,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_87 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":false,"size":[100,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_88 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","pointsLeft":false,"size":[192,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_89 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello\nWorld!","pointsLeft":true,"size":[74,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_90 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n","pointsLeft":true,"size":[189,132]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_91 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"","pointsLeft":true,"size":[74,52]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_92 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(skinIdTest, context, [])),
            ...(await call(loadModuleVarTest, context, ["TextBubbleSkin","./TextBubbleSkin.js"])),
            ...(await call(newTextBubbleSkin, context, [])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"pneumonoultramicroscopicsilicovolcanoconiosis","pointsLeft":true,"size":[192,68]}])),
            ...(await call(setTextBubble, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(skinSize, context, [])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(texture, context, [null]))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
