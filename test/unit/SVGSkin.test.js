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
function register_newSVGSkin () {
    if (window.newSVGSkin) return;
    window.newSVGSkin = function newSVGSkin (context) {
        context.value = context.skin = new context.module.SVGSkin(context.skinId, context.renderer);
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
function register_loadSVG_text () {
    if (window.loadSVG_text) return;
    window.loadSVG_text = async function loadSVG_text (context) {
        context.imageSource = await context.assetResponse.text();
        return [
            ['equal', typeof context.imageSource, 'string', 'loaded svg string']
        ];
    };
}
function register_setSVG () {
    if (window.setSVG) return;
    window.setSVG = function setSVG (context) {
        context.imageRotationCenter = context.imageSize.map(dim => dim / 2);
        context.skin.setSVG(context.imageSource);
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
function register_setSVG_rotationCenter () {
    if (window.setSVG_rotationCenter) return;
    window.setSVG_rotationCenter = function setSVG_rotationCenter (context) {
        context.imageRotationCenter = [10, 10];
        context.skin.setSVG(context.imageSource, [10, 10]);
    };
}
function register_setOldImageRotationCenter () {
    if (window.setOldImageRotationCenter) return;
    window.setOldImageRotationCenter = function setOldImageRotationCenter (context) {
        context.oldImageRotationCenter = context.imageRotationCenter;
    };
}
function register_oldSkinRotationCenter () {
    if (window.oldSkinRotationCenter) return;
    window.oldSkinRotationCenter = function oldSkinRotationCenter (context) {
        const {rotationCenter} = context.skin;
        return [['same',
                [Math.ceil(rotationCenter[0]), Math.ceil(rotationCenter[1])],
                context.oldImageRotationCenter,
                'rotationCenter has not updated yet'
        ]];
    };
}
chromelessTest('1: new SVGSkin, dispose', async function (t, chromeless) {
    t.plan(13);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_dispose]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
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
chromelessTest('2: new SVGSkin, setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), dispose', async function (t, chromeless) {
    t.plan(24);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_dispose]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(loadModuleVarTest, context, ["RenderConstants","./RenderConstants.js"])),
                ...(await call(dispose, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('3: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), dispose', async function (t, chromeless) {
    t.plan(24);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_dispose]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(loadModuleVarTest, context, ["RenderConstants","./RenderConstants.js"])),
                ...(await call(dispose, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('4: new SVGSkin, setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(31);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('5: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(31);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('6: new SVGSkin, setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(31);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('7: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(31);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('8: new SVGSkin, setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(31);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('9: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(31);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('10: new SVGSkin, setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(31);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('11: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(31);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_valueTest, register_hasPropertyTest, register_rotationCenterIsArray, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
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
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('12: new SVGSkin, setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('13: new SVGSkin, setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('14: new SVGSkin, setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('15: new SVGSkin, setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('16: new SVGSkin, setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('17: new SVGSkin, setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('18: new SVGSkin, setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('19: new SVGSkin, setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('20: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('21: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('22: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('23: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('24: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('25: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('26: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('27: new SVGSkin, setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('28: new SVGSkin, setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('29: new SVGSkin, setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('30: new SVGSkin, setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('31: new SVGSkin, setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('32: new SVGSkin, setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('33: new SVGSkin, setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('34: new SVGSkin, setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('35: new SVGSkin, setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('36: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('37: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('38: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('39: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('40: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('41: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('42: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('43: new SVGSkin, setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('44: new SVGSkin, setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('45: new SVGSkin, setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('46: new SVGSkin, setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('47: new SVGSkin, setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('48: new SVGSkin, setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('49: new SVGSkin, setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('50: new SVGSkin, setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('51: new SVGSkin, setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('52: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('53: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('54: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('55: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('56: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('57: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('58: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('59: new SVGSkin, setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('60: new SVGSkin, setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('61: new SVGSkin, setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('62: new SVGSkin, setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('63: new SVGSkin, setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('64: new SVGSkin, setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('65: new SVGSkin, setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('66: new SVGSkin, setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('67: new SVGSkin, setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('68: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('69: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(orange50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["orange50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('70: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('71: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(purple100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["purple100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('72: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('73: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient50x50.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient50x50.svg"])),
                ...(await call(storeImageSize, context, [[50,50]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('74: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('75: new SVGSkin, setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200]), setSVG(gradient100x100.svg, [10, 10]), getTexture(null), getTexture([100,100]), getTexture([200,200])', async function (t, chromeless) {
    t.plan(43);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_createCanvas, register_newRenderWebGL, register_skinIdTest, register_newSVGSkin, register_willEmitEventTest, register_loadAsset_fetch, register_storeImageSize, register_loadSVG_text, register_setSVG_rotationCenter, register_valueTest, register_hasPropertyTest, register_skinSize, register_didEmitEventTest, register_skinRotationCenter, register_texture, register_setOldImageRotationCenter, register_setSVG_rotationCenter, register_oldSkinRotationCenter]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["RenderWebGL","./RenderWebGL.js"])),
                ...(await call(createCanvas, context, [])),
                ...(await call(newRenderWebGL, context, [])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(loadModuleVarTest, context, ["SVGSkin","./SVGSkin.js"])),
                ...(await call(newSVGSkin, context, [])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
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
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]])),
                ...(await call(willEmitEventTest, context, ["WasAltered"])),
                ...(await call(loadAsset_fetch, context, ["gradient100x100.svg"])),
                ...(await call(storeImageSize, context, [[100,100]])),
                ...(await call(loadSVG_text, context, [])),
                ...(await call(setOldImageRotationCenter, context, [])),
                ...(await call(setSVG_rotationCenter, context, [])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(skinSize, context, [])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(oldSkinRotationCenter, context, [])),
                ...(await call(didEmitEventTest, context, ["WasAltered"])),
                ...(await call(valueTest, context, ["skin"])),
                ...(await call(hasPropertyTest, context, ["size"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(skinRotationCenter, context, [])),
                ...(await call(texture, context, [null])),
                ...(await call(texture, context, [[100,100]])),
                ...(await call(texture, context, [[200,200]]))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});