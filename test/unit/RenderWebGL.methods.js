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
async function loadAsset_fetch (context, name) {
    context.assetResponse = await fetch(`./assets/${name}`);
    return [
        ['comment', `fetch('./assets/${name}')`],
        ['equal', typeof context.assetResponse, 'object', 'sent asset request']
    ];
}
function storeImageSize (context, size) {
    context.imageSize = size;
}
async function loadPNG_arrayBuffer (context) {
    context.imageSourceBuffer = await context.assetResponse.arrayBuffer();
    context.imageSourceBlob = new Blob([context.imageSourceBuffer], {type: 'image/png'});
    return [
        ['equal', typeof context.imageSourceBuffer, 'object', 'loaded png buffer']
    ];
}
async function loadPNG_image (context) {
    context.imageSource = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(context.imageSourceBlob);
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
    return [
        ['ok', context.imageSource instanceof Image, 'loaded png image']
    ];
}
function imageRotationCenter (context) {
    context.imageRotationCenter = [
        context.imageSize[0] / 2, context.imageSize[1] / 2
    ];
}
function createBitmapSkin (context) {
    context.skinId = context.renderer.createBitmapSkin(context.imageSource);
}
function setSkinContext (context) {
    context.skin = context.renderer._allSkins[context.skinId];
}
function rotationCenterIsArray (context) {
    return [['ok', context.value.rotationCenter.length >= 2, 'rotationCenter is an array']];
}
function skinRotationCenter (context) {
    const {rotationCenter} = context.skin;
    return [['same',
            [Math.ceil(rotationCenter[0]), Math.ceil(rotationCenter[1])],
            context.imageRotationCenter,
            'skin.rotationCenter matches'
    ]];
}
async function loadPNG_canvas (context) {
    const imageCanvas = document.createElement('canvas');
    const imageContext = imageCanvas.getContext('2d');
    imageCanvas.width = context.imageSource.width;
    imageCanvas.height = context.imageSource.height;
    imageContext.drawImage(context.imageSource, 0, 0, imageCanvas.width, imageCanvas.height);
    context.imageSource = imageCanvas;
    return [
        ['ok', context.imageSource instanceof HTMLCanvasElement, 'rendered image into canvas']
    ];
}
async function loadPNG_imageBitmap (context) {
    context.imageSource = await createImageBitmap(context.imageSourceBlob);
    return [
        ['equal', typeof context.imageSource, 'object', 'loaded png imageBitmap']
    ];
}
async function loadSVG_text (context) {
    context.imageSource = await context.assetResponse.text();
    return [
        ['equal', typeof context.imageSource, 'string', 'loaded svg string']
    ];
}
function createSVGSkin (context) {
    context.skinId = context.renderer.createSVGSkin(context.imageSource);
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
function createTextBubble (context, textBubble) {
    context.textBubble = textBubble;
    context.imageSize = textBubble.size;
    context.imageRotationCenter = [0, 0];
}
function createTextBubbleSkin (context) {
    const {type, text, pointsLeft} = context.textBubble;
    context.skinId = context.renderer.createTextSkin(type, text, pointsLeft);
}
function createPenSkin (context) {
    context.skinId = context.renderer.createPenSkin();
}
function updateBitmapSkin (context) {
    context.renderer.updateBitmapSkin(context.skinId, context.imageSource);
}
function updateSVGSkin (context) {
    context.renderer.updateSVGSkin(context.skinId, context.imageSource);
}
function updateTextBubbleSkin (context) {
    const {type, text, pointsLeft} = context.textBubble;
    context.renderer.updateTextSkin(context.skinId, type, text, pointsLeft);
}
function rendererSetLayerGroupOrdering (context) {
    context.renderer.setLayerGroupOrdering(['stage', 'sprite']);
}
function createDrawable (context) {
    context.drawableId = context.renderer.createDrawable('sprite');
    context.drawable = context.renderer._allDrawables[context.drawableId];
    return [
        ['ok', context.drawableId >= 0, 'drawableId'],
        ['ok', Boolean(context.drawable), 'drawable'],
        ['ok', context.renderer._allDrawables.length > 0, '_allDrawables.length > 0']
    ];
}
function assignDrawableSkin (context) {
    context.drawable.skin = context.skin;
    context.stampDrawableId = context.drawableId;
    context.stampDrawable = context.drawable;
    context.stampSkinId = context.skinId;
    context.stampSkin = context.skin;
}
function drawableHasDirtyTransform (context) {
    return [
        ['ok', context.drawable.skin === context.skin, 'drawable skin updated'],
        ['ok', context.drawable._transformDirty, 'transform is dirty after skin change']
    ];
}
function draw (context) {
    document.querySelector('.test-preview').appendChild(context.canvas);
    context.renderer.draw();
}
function isTouchingColor (context) {
    return [
        ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
        ['ok',
            context.renderer.isTouchingColor(context.drawableId, [255, 171, 26]),
            'touching orange'],
        ['ok',
            context.renderer.isTouchingColor(context.drawableId, [0, 0, 0]),
            'touching black'],
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
            ...(await call(hasPropertyTest, context, ["canvas"]))
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
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_image, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, []))
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
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_image, context, [])),
            ...(await call(loadPNG_canvas, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, []))
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
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, []))
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
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, []))
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
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, []))
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
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, []))
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
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"]))
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
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, []))
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
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, []))
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
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"]))
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
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, []))
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
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, []))
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
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"]))
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
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(function (context) {
                const penAttributes = {
                    diameter: 5,
                    color4f: [1, 0, 0, 1]
                };
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.drawable.skin = context.skin;
                context.penDrawableId = context.drawableId;
                context.penDrawable = context.drawable;
                context.penSkinId = context.skinId;
                context.penSkin = context.penSkin;
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(assignDrawableSkin, context, [])),
            ...(await call(function (context) {
                context.drawableId = context.penDrawableId;
                context.drawable = context.penDrawable;
                
                context.renderer.penClear(context.penSkinId);
                context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
            }, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(updateBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(updateSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(drawableHasDirtyTransform, context, []))
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
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, [])),
            ...(await call(function (context) {
                context.drawable.getAABB();
                return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
            }, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(updateTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(drawableHasDirtyTransform, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_69 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_70 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_71 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_72 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_73 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_74 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_75 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_76 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_77 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_78 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_79 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_80 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_81 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_82 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_83 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_84 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_85 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_86 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_87 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_88 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_89 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_90 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_91 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_92 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_93 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_94 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_95 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_96 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_97 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_98 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_99 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_100 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_101 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_102 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_103 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_104 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_105 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_106 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_107 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_108 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_109 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_110 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_111 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_112 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_113 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_114 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_115 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_116 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                return [
                    ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                    ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
                ];
            }, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_117 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_118 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_119 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_120 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_121 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_122 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_123 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_124 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_125 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_126 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_127 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_128 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_129 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_130 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_131 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_132 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_133 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_134 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_135 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_136 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_137 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_138 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_139 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_140 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_141 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_142 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_143 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_144 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_145 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_146 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_147 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_148 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_149 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_150 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_151 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_152 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_153 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_154 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_155 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_156 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_157 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_158 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_159 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_160 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_161 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_162 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_163 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_164 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[10,10]}}])),
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[10,10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(function (context, config) {
                context.drawableConfig = config;
            }, context, [{"skin":["svgImage","bitmapImage"],"properties":{"position":[-10,-10]}}])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context, properties) {
                context.drawable.updateProperties(properties);
            }, context, [{"position":[-10,-10]}])),
            ...(await call(function (context) {
                context.drawable.updateProperties({scale: [150, 150]});
            }, context, [])),
            ...(await call(draw, context, [])),
            ...(await call(function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }, context, [])),
            ...(await call(isTouchingColor, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_165 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(draw, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_166 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadPNG_arrayBuffer, context, [])),
            ...(await call(loadPNG_imageBitmap, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createBitmapSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.renderer._setNativeSize(960, 720);
            }, context, [])),
            ...(await call(draw, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_167 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(draw, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_168 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
            ...(await call(storeImageSize, context, [[50,50]])),
            ...(await call(loadSVG_text, context, [])),
            ...(await call(imageRotationCenter, context, [])),
            ...(await call(createSVGSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(willEmitEventTest, context, ["WasAltered"])),
            ...(await call(didEmitEventTest, context, ["WasAltered"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.renderer._setNativeSize(960, 720);
            }, context, [])),
            ...(await call(draw, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_169 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(draw, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_170 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true,"size":[100,52]}])),
            ...(await call(createTextBubbleSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.renderer._setNativeSize(960, 720);
            }, context, [])),
            ...(await call(draw, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_171 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(draw, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
async function test_172 (coverage) {
    try {
        const context = {};
        return [
            ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
            ...(await call(createCanvas, context, [])),
            ...(await call(newRenderWebGL, context, [])),
            ...(await call(valueTest, context, ["renderer"])),
            ...(await call(hasPropertyTest, context, ["gl"])),
            ...(await call(hasPropertyTest, context, ["canvas"])),
            ...(await call(rendererSetLayerGroupOrdering, context, [])),
            ...(await call(createDrawable, context, [])),
            ...(await call(function (context) {
                context.imageSize = [480, 360];
                context.imageRotationCenter = [240, 180];
            }, context, [])),
            ...(await call(createPenSkin, context, [])),
            ...(await call(setSkinContext, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["on"])),
            ...(await call(hasPropertyTest, context, ["off"])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["id"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(hasPropertyTest, context, ["isRaster"])),
            ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
            ...(await call(rotationCenterIsArray, context, [])),
            ...(await call(valueTest, context, ["skin"])),
            ...(await call(hasPropertyTest, context, ["size"])),
            ...(await call(hasPropertyTest, context, ["rotationCenter"])),
            ...(await call(skinRotationCenter, context, [])),
            ...(await call(function assignDrawableSkin (context) {
                context.drawable.skin = context.skin;
            }, context, [])),
            ...(await call(function (context) {
                context.renderer._setNativeSize(960, 720);
            }, context, [])),
            ...(await call(draw, context, []))
        ];
    } catch (e) {
        return [['fail', e.stack || e.message]];
    }
}
