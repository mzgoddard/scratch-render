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
function register_skinIdTest () {
    if (window.skinIdTest) return;
    window.skinIdTest = function skinIdTest (context) {
        context.skinId = Math.random().toString().slice(2);
    };
}
function register_newBitmapSkin () {
    if (window.newBitmapSkin) return;
    window.newBitmapSkin = function newBitmapSkin (context) {
        context.value = context.skin = new context.module.BitmapSkin(context.skinId, context.renderer);
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
function register_setBitmap () {
    if (window.setBitmap) return;
    window.setBitmap = function setBitmap (context) {
        context.imageResolution = 2;
        context.imageRotationCenter = context.imageSize.map(dim => dim / 2);
        context.skin.setBitmap(context.imageSource);
    };
}
function register_skinSize () {
    if (window.skinSize) return;
    window.skinSize = function skinSize (context) {
        const {size} = context.skin;
        return [['same',
                [Math.ceil(size[0]), Math.ceil(size[1])],
                context.imageSize,
                'skin.size matches image size'
        ]];
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
function register_texture () {
    if (window.texture) return;
    window.texture = function texture (context, scale) {
        const tex = context.skin.getTexture(scale);
        const uniforms = context.skin.getUniforms(scale);
        return [
            ['ok', tex !== null && typeof tex === 'object', 'returns texture'],
            ['ok', uniforms.u_skin === tex, 'u_skin is texture'],
            ['same', Array.from(uniforms.u_skinSize, Math.ceil), context.imageSize, 'u_skinSize is size']
        ];
    };
}
function register_setBitmap_rotationCenter () {
    if (window.setBitmap_rotationCenter) return;
    window.setBitmap_rotationCenter = function setBitmap_rotationCenter (context) {
        context.imageResolution = 2;
        context.imageRotationCenter = [10, 10];
        context.skin.setBitmap(context.imageSource, context.imageResolution, [10, 10]);
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
function register_dispose () {
    if (window.dispose) return;
    window.dispose = function dispose (context) {
        context.skin.dispose();
        return [['equal',
                context.skin.id,
                context.module.RenderConstants.ID_NONE,
                'disposed of its id'
        ]];
    };
}
chromelessTest('1: new BitmapSkin', async function (t, chromeless) {
    t.plan(11);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["on"])),
                ...(await call(hasPropertyTest, context, ["off"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["id"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(hasPropertyTest, context, ["isRaster"])),
                ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
                ...(await call(rotationCenterIsArray, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('2: new BitmapSkin, new Image, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(17);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_image, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_image, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('3: new BitmapSkin, new Image, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(17);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_image, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_image, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('4: new BitmapSkin, new Image, HTMLCanvasElement, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(18);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_image, register_loadPNG_canvas, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_image, context, [])),
                ...(await call(loadPNG_canvas, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('5: new BitmapSkin, new Image, HTMLCanvasElement, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(18);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_image, register_loadPNG_canvas, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_image, context, [])),
                ...(await call(loadPNG_canvas, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('6: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(17);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('7: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(17);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('8: new BitmapSkin, dispose', async function (t, chromeless) {
    t.plan(13);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_dispose]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
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
    });
});
chromelessTest('9: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined), dispose', async function (t, chromeless) {
    t.plan(19);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_dispose]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('10: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined), dispose', async function (t, chromeless) {
    t.plan(19);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_dispose]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('11: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('12: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('13: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('14: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('15: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('16: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('17: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('18: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(26);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('19: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('20: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('21: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('22: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('23: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('24: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('25: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('26: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('27: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('28: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('29: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('30: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('31: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('32: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('33: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('34: new BitmapSkin, createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('35: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('36: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('37: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('38: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('39: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('40: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('41: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('42: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('43: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('44: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('45: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('46: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('47: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('48: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('49: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('50: new BitmapSkin, createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('51: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('52: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('53: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('54: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('55: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('56: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('57: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('58: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('59: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('60: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('61: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('62: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('63: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('64: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('65: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('66: new BitmapSkin, createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('67: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('68: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('69: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('70: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('71: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('72: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('73: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('74: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('75: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('76: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(orange50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('77: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('78: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(purple100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('79: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('80: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient50x50.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.png"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});
chromelessTest('81: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap, context, [])),
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
    });
});
chromelessTest('82: new BitmapSkin, createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined), createImageBitmap, setBitmap(gradient100x100.png, 2, [10, 10]), getTexture(undefined)', async function (t, chromeless) {
    t.plan(32);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newBitmapSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadPNG_arrayBuffer, register_loadPNG_imageBitmap, register_setBitmap_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setBitmap_rotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["BitmapSkin","./BitmapSkin.js"])),
                ...(await call(newBitmapSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.png"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadPNG_arrayBuffer, context, [])),
                ...(await call(loadPNG_imageBitmap, context, [])),
                ...(await call(setBitmap_rotationCenter, context, [])),
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
    });
});