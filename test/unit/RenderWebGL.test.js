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
        context.imageRotationCenter = [context.imageSize[0] / 2, context.imageSize[1] / 2];
    };
}
function register_createBitmapSkin () {
    if (window.createBitmapSkin) return;
    window.createBitmapSkin = function createBitmapSkin (context) {
        context.skinId = context.renderer.createBitmapSkin(context.imageSource);
        context.skin = context.renderer._allSkins[context.skinId];
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
        context.skin = context.renderer._allSkins[context.skinId];
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
function register_updateBitmapSkin () {
    if (window.updateBitmapSkin) return;
    window.updateBitmapSkin = function updateBitmapSkin (context) {
        context.renderer.updateBitmapSkin(context.skinId, context.imageSource);
        context.skin = context.renderer._allSkins[context.skinId];
    };
}
function register_updateSVGSkin () {
    if (window.updateSVGSkin) return;
    window.updateSVGSkin = function updateSVGSkin (context) {
        context.renderer.updateSVGSkin(context.skinId, context.imageSource);
        context.skin = context.renderer._allSkins[context.skinId];
    };
}
chromelessTest('1: new Image, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(17);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_image, register_imageRotationCenter, register_createBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_image, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createBitmapSkin, context, [])),
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
chromelessTest('2: new Image, HTMLCanvasElement, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(18);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_image, register_loadPNG_canvas, register_imageRotationCenter, register_createBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_image, context, [])),
                ...(await call(loadPNG_canvas, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createBitmapSkin, context, [])),
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
chromelessTest('3: createImageBitmap, createBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(17);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createBitmapSkin, context, [])),
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
chromelessTest('4: createSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(18);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_valueTest, register_willEmitEventTest, register_didEmitEventTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createSVGSkin, context, [])),
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
chromelessTest('5: createSVGSkin(purple100x100.svg)', async function (t, chromeless) {
    t.plan(18);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_valueTest, register_willEmitEventTest, register_didEmitEventTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createSVGSkin, context, [])),
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
chromelessTest('6: createSVGSkin(gradient50x50.svg)', async function (t, chromeless) {
    t.plan(18);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_valueTest, register_willEmitEventTest, register_didEmitEventTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createSVGSkin, context, [])),
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
chromelessTest('7: createSVGSkin(gradient100x100.svg)', async function (t, chromeless) {
    t.plan(18);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_valueTest, register_willEmitEventTest, register_didEmitEventTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createSVGSkin, context, [])),
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
chromelessTest('8: createImageBitmap, createBitmapSkin(orange50x50.png), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(20);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter, register_imageRotationCenter, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createBitmapSkin, context, [])),
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
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(updateBitmapSkin, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('9: createImageBitmap, createBitmapSkin(orange50x50.png), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(21);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_createBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter, register_loadSVG_text, register_imageRotationCenter, register_updateSVGSkin, register_willEmitEventTest, register_didEmitEventTest]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createBitmapSkin, context, [])),
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
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(updateSVGSkin, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(didEmitEventTest, context, ["WasAltered"]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('10: createSVGSkin(orange50x50.svg), createImageBitmap, updateBitmapSkin(orange50x50.png)', async function (t, chromeless) {
    t.plan(21);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_valueTest, register_willEmitEventTest, register_didEmitEventTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_imageRotationCenter, register_updateBitmapSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createSVGSkin, context, [])),
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
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(updateBitmapSkin, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('11: createSVGSkin(orange50x50.svg), updateSVGSkin(orange50x50.svg)', async function (t, chromeless) {
    t.plan(22);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_imageRotationCenter, register_createSVGSkin, register_valueTest, register_willEmitEventTest, register_didEmitEventTest, register_hasPropertyTest, register_rotationCenterIsArray, register_skinRotationCenter, register_imageRotationCenter, register_updateSVGSkin]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(createSVGSkin, context, [])),
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
                ...(await call(imageRotationCenter, context, [])),
                ...(await call(updateSVGSkin, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(didEmitEventTest, context, ["WasAltered"]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});