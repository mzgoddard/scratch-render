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
// 1: RenderWebGL tests: 6 asserts: 4
async function test_1 () {
    const context = {};
    return [
        ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
        ...(await call(createCanvas, context, [])),
        ...(await call(newRenderWebGL, context, [])),
        ...(await call(valueTest, context, ["renderer"])),
        ...(await call(hasPropertyTest, context, ["gl"])),
        ...(await call(hasPropertyTest, context, ["canvas"]))
    ];
}
// 2: new Image, createBitmapSkin(orange50x50.png)
async function test_2 () {
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
}
// 3: new Image, HTMLCanvasElement, createBitmapSkin(orange50x50.png)
async function test_3 () {
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
}
// 4: createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_4 () {
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
}
// 5: createSVGSkin(orange50x50.svg)
async function test_5 () {
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
}
// 6: createTextBubbleSkin(say, Hello World!, true)
async function test_6 () {
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
}
// 7: RenderWebGL tests: 22 asserts: 17
async function test_7 () {
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
}
// 8: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_8 () {
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
}
// 9: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)
async function test_9 () {
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
}
// 10: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)
async function test_10 () {
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
}
// 11: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_11 () {
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
}
// 12: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)
async function test_12 () {
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
}
// 13: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)
async function test_13 () {
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
}
// 14: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_14 () {
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
}
// 15: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)
async function test_15 () {
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
}
// 16: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)
async function test_16 () {
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
}
// 17: RenderWebGL tests: 27 asserts: 20
async function test_17 () {
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
}
// 18: RenderWebGL tests: 27 asserts: 20
async function test_18 () {
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
}
// 19: createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_19 () {
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
}
// 20: createSVGSkin(orange50x50.svg)
async function test_20 () {
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
}
// 21: createTextBubbleSkin(say, Hello World!, true)
async function test_21 () {
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
}
// 22: RenderWebGL tests: 27 asserts: 20
async function test_22 () {
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
}
// 23: RenderWebGL tests: 27 asserts: 20
async function test_23 () {
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
}
// 24: createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_24 () {
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
}
// 25: createSVGSkin(orange50x50.svg)
async function test_25 () {
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
}
// 26: createTextBubbleSkin(say, Hello World!, true)
async function test_26 () {
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
}
// 27: createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_27 () {
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
}
// 28: createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_28 () {
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
}
// 29: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_29 () {
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
}
// 30: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_30 () {
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
}
// 31: createImageBitmap, createBitmapSkin(orange50x50.png), createTextBubbleSkin(say, Hello World!, true)
async function test_31 () {
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
}
// 32: createSVGSkin(orange50x50.svg)
async function test_32 () {
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
}
// 33: createSVGSkin(orange50x50.svg)
async function test_33 () {
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
}
// 34: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_34 () {
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
}
// 35: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_35 () {
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
}
// 36: createSVGSkin(orange50x50.svg), createTextBubbleSkin(say, Hello World!, true)
async function test_36 () {
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
}
// 37: createTextBubbleSkin(say, Hello World!, true)
async function test_37 () {
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
}
// 38: createTextBubbleSkin(say, Hello World!, true)
async function test_38 () {
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
}
// 39: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_39 () {
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
}
// 40: createTextBubbleSkin(say, Hello World!, true), createSVGSkin(orange50x50.svg)
async function test_40 () {
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
}
// 41: createTextBubbleSkin(say, Hello World!, true), createTextBubbleSkin(say, Hello World!, true)
async function test_41 () {
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
}
// 42: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_42 () {
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
}
// 43: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)
async function test_43 () {
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
}
// 44: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)
async function test_44 () {
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
}
// 45: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_45 () {
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
}
// 46: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)
async function test_46 () {
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
}
// 47: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)
async function test_47 () {
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
}
// 48: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_48 () {
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
}
// 49: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)
async function test_49 () {
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
}
// 50: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)
async function test_50 () {
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
}
// 51: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_51 () {
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
}
// 52: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)
async function test_52 () {
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
}
// 53: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)
async function test_53 () {
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
}
// 54: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_54 () {
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
}
// 55: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)
async function test_55 () {
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
}
// 56: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)
async function test_56 () {
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
}
// 57: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_57 () {
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
}
// 58: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)
async function test_58 () {
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
}
// 59: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)
async function test_59 () {
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
}
// 60: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_60 () {
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
}
// 61: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)
async function test_61 () {
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
}
// 62: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)
async function test_62 () {
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
}
// 63: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_63 () {
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
}
// 64: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)
async function test_64 () {
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
}
// 65: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)
async function test_65 () {
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
}
// 66: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)
async function test_66 () {
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
}
// 67: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)
async function test_67 () {
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
}
// 68: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)
async function test_68 () {
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
}
// 69: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_69 () {
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
}
// 70: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_70 () {
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
}
// 71: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_71 () {
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
}
// 72: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_72 () {
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
}
// 73: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_73 () {
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
}
// 74: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_74 () {
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
}
// 75: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_75 () {
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
}
// 76: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_76 () {
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
}
// 77: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_77 () {
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
}
// 78: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_78 () {
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
}
// 79: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_79 () {
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
}
// 80: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_80 () {
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
}
// 81: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_81 () {
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
}
// 82: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_82 () {
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
}
// 83: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_83 () {
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
}
// 84: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_84 () {
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
}
// 85: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_85 () {
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
}
// 86: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_86 () {
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
}
// 87: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_87 () {
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
}
// 88: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_88 () {
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
}
// 89: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_89 () {
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
}
// 90: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_90 () {
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
}
// 91: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_91 () {
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
}
// 92: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_92 () {
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
}
// 93: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_93 () {
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
}
// 94: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_94 () {
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
}
// 95: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_95 () {
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
}
// 96: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_96 () {
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
}
// 97: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_97 () {
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
}
// 98: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_98 () {
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
}
// 99: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_99 () {
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
}
// 100: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_100 () {
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
}
// 101: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_101 () {
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
}
// 102: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_102 () {
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
}
// 103: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_103 () {
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
}
// 104: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_104 () {
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
}
// 105: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_105 () {
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
}
// 106: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_106 () {
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
}
// 107: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_107 () {
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
}
// 108: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_108 () {
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
}
// 109: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_109 () {
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
}
// 110: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_110 () {
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
}
// 111: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_111 () {
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
}
// 112: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_112 () {
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
}
// 113: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_113 () {
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
}
// 114: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_114 () {
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
}
// 115: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_115 () {
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
}
// 116: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_116 () {
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
}
// 117: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_117 () {
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
}
// 118: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_118 () {
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
}
// 119: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_119 () {
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
}
// 120: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_120 () {
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
}
// 121: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_121 () {
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
}
// 122: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_122 () {
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
}
// 123: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_123 () {
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
}
// 124: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_124 () {
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
}
// 125: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_125 () {
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
}
// 126: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_126 () {
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
}
// 127: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_127 () {
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
}
// 128: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_128 () {
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
}
// 129: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_129 () {
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
}
// 130: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_130 () {
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
}
// 131: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_131 () {
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
}
// 132: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_132 () {
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
}
// 133: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_133 () {
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
}
// 134: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_134 () {
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
}
// 135: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_135 () {
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
}
// 136: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_136 () {
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
}
// 137: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_137 () {
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
}
// 138: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_138 () {
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
}
// 139: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_139 () {
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
}
// 140: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)
async function test_140 () {
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
}
// 141: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_141 () {
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
}
// 142: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_142 () {
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
}
// 143: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_143 () {
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
}
// 144: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_144 () {
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
}
// 145: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_145 () {
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
}
// 146: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_146 () {
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
}
// 147: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_147 () {
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
}
// 148: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_148 () {
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
}
// 149: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_149 () {
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
}
// 150: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_150 () {
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
}
// 151: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_151 () {
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
}
// 152: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_152 () {
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
}
// 153: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_153 () {
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
}
// 154: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_154 () {
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
}
// 155: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_155 () {
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
}
// 156: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_156 () {
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
}
// 157: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_157 () {
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
}
// 158: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_158 () {
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
}
// 159: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_159 () {
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
}
// 160: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_160 () {
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
}
// 161: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_161 () {
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
}
// 162: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_162 () {
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
}
// 163: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_163 () {
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
}
// 164: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)
async function test_164 () {
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
}
// 165: createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_165 () {
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
}
// 166: createImageBitmap, createBitmapSkin(orange50x50.png)
async function test_166 () {
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
}
// 167: createSVGSkin(orange50x50.svg)
async function test_167 () {
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
}
// 168: createSVGSkin(orange50x50.svg)
async function test_168 () {
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
}
// 169: createTextBubbleSkin(say, Hello World!, true)
async function test_169 () {
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
}
// 170: createTextBubbleSkin(say, Hello World!, true)
async function test_170 () {
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
}
// 171: RenderWebGL tests: 26 asserts: 20
async function test_171 () {
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
}
// 172: RenderWebGL tests: 27 asserts: 20
async function test_172 () {
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
}
