const chromelessTest = require('../fixtures/chromeless-tape');

function register (fns) {
   return `function () {
       ${fns.map(fn => `(${fn.toString()})();
`).join('')}
   }`;
}

function register_call () {
    if (window.call) return;
    window.call = async function call (fn, context, args) {
        return [
            ['comment', `${fn.name}(...${JSON.stringify(args)})`],
            ...((await fn(context, ...args)) || [])
        ];
    };
}
function register_loadModuleVarTest () {
    if (window.loadModuleVarTest) return;
    window.loadModuleVarTest = function loadModuleVarTest (context, name, srcPath) {
        context.module = context.module || {};
        context.module[name] = window.ScratchRenderFiles(srcPath);
        return [['ok', context.module[name], `module ${name} loaded`]];
    };
}
function register_createCanvas () {
    if (window.createCanvas) return;
    window.createCanvas = function createCanvas (context) {
        context.canvas = document.createElement('canvas');
    };
}
function register_newRenderWebGL () {
    if (window.newRenderWebGL) return;
    window.newRenderWebGL = function newRenderWebGL (context) {
        context.renderer = new context.module.RenderWebGL(context.canvas);
    };
}
function register_valueTest () {
    if (window.valueTest) return;
    window.valueTest = function valueTest (context, key) {
        context.value = context[key];
        return [['ok', typeof context.value !== 'undefined', 'context.value is set']];
    };
}
function register_hasPropertyTest () {
    if (window.hasPropertyTest) return;
    window.hasPropertyTest = function hasPropertyTest (context, key) {
        // Test that this does not throw.
        context.value[key];
        return [['ok', key in context.value, `has ${key} property`]];
    };
}
function register_loadAsset_fetch () {
    if (window.loadAsset_fetch) return;
    window.loadAsset_fetch = async function loadAsset_fetch (context, name) {
        context.assetResponse = await fetch(`./assets/${name}`);
        return [
            ['comment', `fetch('./assets/${name}')`],
            ['equal', typeof context.assetResponse, 'object', 'sent asset request']
        ];
    };
}
function register_storeImageSize () {
    if (window.storeImageSize) return;
    window.storeImageSize = function storeImageSize (context, size) {
        context.imageSize = size;
    };
}
function register_loadPNG_arrayBuffer () {
    if (window.loadPNG_arrayBuffer) return;
    window.loadPNG_arrayBuffer = async function loadPNG_arrayBuffer (context) {
        context.imageSourceBuffer = await context.assetResponse.arrayBuffer();
        context.imageSourceBlob = new Blob([context.imageSourceBuffer], {type: 'image/png'});
        return [
            ['equal', typeof context.imageSourceBuffer, 'object', 'loaded png buffer']
        ];
    };
}
function register_loadPNG_image () {
    if (window.loadPNG_image) return;
    window.loadPNG_image = async function loadPNG_image (context) {
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
    };
}
function register_imageRotationCenter () {
    if (window.imageRotationCenter) return;
    window.imageRotationCenter = function imageRotationCenter (context) {
        context.imageRotationCenter = [
            context.imageSize[0] / 2, context.imageSize[1] / 2
        ];
    };
}
function register_createBitmapSkin () {
    if (window.createBitmapSkin) return;
    window.createBitmapSkin = function createBitmapSkin (context) {
        context.skinId = context.renderer.createBitmapSkin(context.imageSource);
    };
}
function register_setSkinContext () {
    if (window.setSkinContext) return;
    window.setSkinContext = function setSkinContext (context) {
        context.skin = context.renderer._allSkins[context.skinId];
    };
}
function register_rotationCenterIsArray () {
    if (window.rotationCenterIsArray) return;
    window.rotationCenterIsArray = function rotationCenterIsArray (context) {
        return [['ok', context.value.rotationCenter.length >= 2, 'rotationCenter is an array']];
    };
}
function register_skinRotationCenter () {
    if (window.skinRotationCenter) return;
    window.skinRotationCenter = function skinRotationCenter (context) {
        const {rotationCenter} = context.skin;
        return [['same',
                [Math.ceil(rotationCenter[0]), Math.ceil(rotationCenter[1])],
                context.imageRotationCenter,
                'skin.rotationCenter matches'
        ]];
    };
}
function register_loadPNG_canvas () {
    if (window.loadPNG_canvas) return;
    window.loadPNG_canvas = async function loadPNG_canvas (context) {
        const imageCanvas = document.createElement('canvas');
        const imageContext = imageCanvas.getContext('2d');
        imageCanvas.width = context.imageSource.width;
        imageCanvas.height = context.imageSource.height;
        imageContext.drawImage(context.imageSource, 0, 0, imageCanvas.width, imageCanvas.height);
        context.imageSource = imageCanvas;
        return [
            ['ok', context.imageSource instanceof HTMLCanvasElement, 'rendered image into canvas']
        ];
    };
}
function register_loadPNG_imageBitmap () {
    if (window.loadPNG_imageBitmap) return;
    window.loadPNG_imageBitmap = async function loadPNG_imageBitmap (context) {
        context.imageSource = await createImageBitmap(context.imageSourceBlob);
        return [
            ['equal', typeof context.imageSource, 'object', 'loaded png imageBitmap']
        ];
    };
}
function register_loadSVG_text () {
    if (window.loadSVG_text) return;
    window.loadSVG_text = async function loadSVG_text (context) {
        context.imageSource = await context.assetResponse.text();
        return [
            ['equal', typeof context.imageSource, 'string', 'loaded svg string']
        ];
    };
}
function register_createSVGSkin () {
    if (window.createSVGSkin) return;
    window.createSVGSkin = function createSVGSkin (context) {
        context.skinId = context.renderer.createSVGSkin(context.imageSource);
    };
}
function register_willEmitEventTest () {
    if (window.willEmitEventTest) return;
    window.willEmitEventTest = function willEmitEventTest (context, event) {
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
    };
}
function register_didEmitEventTest () {
    if (window.didEmitEventTest) return;
    window.didEmitEventTest = async function didEmitEventTest (context, event) {
        return [
            await Promise.race([
                context.event[event].calledPromise
                .then(({called}) => (['ok', called, `did emit ${event}`])),
                new Promise((resolve) => setTimeout(resolve, 100))
                .then(() => (['fail', 'timeout']))
            ])
        ];
    };
}
function register_createTextBubble () {
    if (window.createTextBubble) return;
    window.createTextBubble = function createTextBubble (context, textBubble) {
        context.textBubble = textBubble;
        context.imageRotationCenter = [0, 0];
    };
}
function register_createTextBubbleSkin () {
    if (window.createTextBubbleSkin) return;
    window.createTextBubbleSkin = function createTextBubbleSkin (context) {
        const {type, text, pointsLeft} = context.textBubble;
        context.skinId = context.renderer.createTextSkin(type, text, pointsLeft);
    };
}
function register_createPenSkin () {
    if (window.createPenSkin) return;
    window.createPenSkin = function createPenSkin (context) {
        context.skinId = context.renderer.createPenSkin();
    };
}
function register_updateBitmapSkin () {
    if (window.updateBitmapSkin) return;
    window.updateBitmapSkin = function updateBitmapSkin (context) {
        context.renderer.updateBitmapSkin(context.skinId, context.imageSource);
    };
}
function register_updateSVGSkin () {
    if (window.updateSVGSkin) return;
    window.updateSVGSkin = function updateSVGSkin (context) {
        context.renderer.updateSVGSkin(context.skinId, context.imageSource);
    };
}
function register_updateTextBubbleSkin () {
    if (window.updateTextBubbleSkin) return;
    window.updateTextBubbleSkin = function updateTextBubbleSkin (context) {
        const {type, text, pointsLeft} = context.textBubble;
        context.renderer.updateTextSkin(context.skinId, type, text, pointsLeft);
    };
}
function register_rendererSetLayerGroupOrdering () {
    if (window.rendererSetLayerGroupOrdering) return;
    window.rendererSetLayerGroupOrdering = function rendererSetLayerGroupOrdering (context) {
        context.renderer.setLayerGroupOrdering(['stage', 'sprite']);
    };
}
function register_createDrawable () {
    if (window.createDrawable) return;
    window.createDrawable = function createDrawable (context) {
        context.drawableId = context.renderer.createDrawable('sprite');
        context.drawable = context.renderer._allDrawables[context.drawableId];
        return [
            ['ok', context.drawableId >= 0, 'drawableId'],
            ['ok', Boolean(context.drawable), 'drawable'],
            ['ok', context.renderer._allDrawables.length > 0, '_allDrawables.length > 0']
        ];
    };
}
function register_assignDrawableSkin () {
    if (window.assignDrawableSkin) return;
    window.assignDrawableSkin = function assignDrawableSkin (context) {
        context.drawable.skin = context.skin;
        context.stampDrawableId = context.drawableId;
        context.stampDrawable = context.drawable;
        context.stampSkinId = context.skinId;
        context.stampSkin = context.skin;
    };
}
function register_drawableHasDirtyTransform () {
    if (window.drawableHasDirtyTransform) return;
    window.drawableHasDirtyTransform = function drawableHasDirtyTransform (context) {
        return [
            ['ok', context.drawable.skin === context.skin, 'drawable skin updated'],
            ['ok', context.drawable._transformDirty, 'transform is dirty after skin change']
        ];
    };
}
function register_draw () {
    if (window.draw) return;
    window.draw = function draw (context) {
        context.renderer.draw();
    };
}
chromelessTest('1: RenderWebGL tests: 6 asserts: 4', async function (t, chromeless) {
    t.plan(4);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('2: new Image, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_image, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('3: new Image, HTMLCanvasElement, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(21);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_image, register_loadPNG_canvas, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('4: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('5: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('6: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(17);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(valueTest, context, ["renderer"])),
                ...(await call(hasPropertyTest, context, ["gl"])),
                ...(await call(hasPropertyTest, context, ["canvas"])),
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('7: RenderWebGL tests: 22 asserts: 17', async function (t, chromeless) {
    t.plan(17);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('8: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(23);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('9: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(24);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('10: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_createTextBubble, register_updateTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('11: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(24);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('12: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(25);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_updateSVGSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('13: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(21);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_createTextBubble, register_updateTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('14: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(valueTest, context, ["renderer"])),
                ...(await call(hasPropertyTest, context, ["gl"])),
                ...(await call(hasPropertyTest, context, ["canvas"])),
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('15: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(valueTest, context, ["renderer"])),
                ...(await call(hasPropertyTest, context, ["gl"])),
                ...(await call(hasPropertyTest, context, ["canvas"])),
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('16: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(17);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_updateTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(valueTest, context, ["renderer"])),
                ...(await call(hasPropertyTest, context, ["gl"])),
                ...(await call(hasPropertyTest, context, ["canvas"])),
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('17: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('18: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('19: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_createBitmapSkin, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('20: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_createSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('21: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('22: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('23: RenderWebGL tests: 27 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('24: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_createBitmapSkin, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('25: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_createSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('26: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('27: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_createBitmapSkin, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('28: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_createBitmapSkin, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('29: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_createBitmapSkin, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('30: createImageBitmap, createBitmapSkin(orange50x50.png), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(33);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_createBitmapSkin, register_assignDrawableSkin, register_loadSVG_text, register_createSVGSkin, register_willEmitEventTest, register_didEmitEventTest]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('31: createImageBitmap, createBitmapSkin(orange50x50.png), createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(29);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_createBitmapSkin, register_assignDrawableSkin, register_createTextBubble, register_createTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('32: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_createSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('33: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(27);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_createSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('34: createSVGSkin(orange50x50.svg), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(33);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_createSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_assignDrawableSkin, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_createBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('35: createSVGSkin(orange50x50.svg), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(34);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_createSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('36: createSVGSkin(orange50x50.svg), createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(30);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_createSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_assignDrawableSkin, register_createTextBubble, register_createTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('37: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('38: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(23);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('39: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(29);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_assignDrawableSkin, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_createBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('40: createTextBubbleSkin(say, Hello World!, true), createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(30);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_assignDrawableSkin, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_createSVGSkin, register_willEmitEventTest, register_didEmitEventTest]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('41: createTextBubbleSkin(say, Hello World!, true), createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_assignDrawableSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('42: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(35);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_updateBitmapSkin, register_drawableHasDirtyTransform]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('43: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(36);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_updateBitmapSkin, register_drawableHasDirtyTransform, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('44: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_updateBitmapSkin, register_drawableHasDirtyTransform, register_createTextBubble, register_updateTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('45: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(36);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_drawableHasDirtyTransform, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('46: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(37);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_drawableHasDirtyTransform]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('47: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(33);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_drawableHasDirtyTransform, register_createTextBubble, register_updateTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('48: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_createTextBubble, register_updateTextBubbleSkin, register_drawableHasDirtyTransform, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('49: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(33);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_createTextBubble, register_updateTextBubbleSkin, register_drawableHasDirtyTransform, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('50: createImageBitmap, createBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(29);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_createTextBubble, register_updateTextBubbleSkin, register_drawableHasDirtyTransform]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, [])),
                ...(await call(function (context) {
                    context.drawable.getAABB();
                    return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
                }, context, [])),
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('51: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(36);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin, register_drawableHasDirtyTransform]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('52: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(37);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin, register_drawableHasDirtyTransform, register_updateSVGSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('53: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(33);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin, register_drawableHasDirtyTransform, register_createTextBubble, register_updateTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('54: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(37);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_updateSVGSkin, register_drawableHasDirtyTransform, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('55: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(38);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_updateSVGSkin, register_drawableHasDirtyTransform]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('56: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(34);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_updateSVGSkin, register_drawableHasDirtyTransform, register_createTextBubble, register_updateTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('57: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(33);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_createTextBubble, register_updateTextBubbleSkin, register_drawableHasDirtyTransform, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('58: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(34);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_createTextBubble, register_updateTextBubbleSkin, register_drawableHasDirtyTransform, register_updateSVGSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('59: createSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(30);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_createTextBubble, register_updateTextBubbleSkin, register_drawableHasDirtyTransform]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, [])),
                ...(await call(function (context) {
                    context.drawable.getAABB();
                    return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
                }, context, [])),
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('60: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin, register_drawableHasDirtyTransform]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('61: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(33);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin, register_drawableHasDirtyTransform, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('62: createTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(29);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin, register_drawableHasDirtyTransform, register_updateTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('63: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(33);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_drawableHasDirtyTransform, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('64: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(34);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_drawableHasDirtyTransform]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('65: createTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(30);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest, register_drawableHasDirtyTransform, register_updateTextBubbleSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('66: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(29);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_updateTextBubbleSkin, register_drawableHasDirtyTransform, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('67: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(30);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_updateTextBubbleSkin, register_drawableHasDirtyTransform, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('68: createTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true), updateTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_updateTextBubbleSkin, register_drawableHasDirtyTransform]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, [])),
                ...(await call(function (context) {
                    context.drawable.getAABB();
                    return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
                }, context, [])),
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
                ...(await call(updateTextBubbleSkin, context, [])),
                ...(await call(setSkinContext, context, [])),
                ...(await call(drawableHasDirtyTransform, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('69: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(23);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_draw]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('70: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(24);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_setSkinContext, register_willEmitEventTest, register_didEmitEventTest, register_rotationCenterIsArray, register_skinRotationCenter, register_draw]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});
chromelessTest('71: createTextBubbleSkin(say, Hello World!, true)', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createTextBubble, register_createTextBubbleSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_draw]));
    
    return await chromeless.evaluate(async function (coverage) {
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
                ...(await call(createTextBubble, context, [{"type":"say","text":"Hello World!","pointsLeft":true}])),
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
    });
});
chromelessTest('72: RenderWebGL tests: 26 asserts: 20', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_valueTest, register_hasPropertyTest, register_rendererSetLayerGroupOrdering, register_createDrawable, register_createPenSkin, register_setSkinContext, register_rotationCenterIsArray, register_skinRotationCenter, register_draw]));
    
    return await chromeless.evaluate(async function (coverage) {
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
    });
});