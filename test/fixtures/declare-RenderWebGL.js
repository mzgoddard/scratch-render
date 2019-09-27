const {value, pass, call, state, evaluate, loadModule, every, some} = require('./declare-tests');

const canvas = evaluate({
    test: [function createCanvas (context) {
        context.canvas = document.createElement('canvas');
    }]
});

const renderer = every([
    loadModule('RenderWebGL', './RenderWebGL.js'),
    canvas,
    evaluate({
        test: [function newRenderWebGL (context) {
            context.renderer = new context.module.RenderWebGL(context.canvas);
        }]
    })
]);

const rendererNewSkin = every([
    call('createImage'),
    evaluate(state => ({
        imageRotationCenter: true,
        test: [function imageRotationCenter (context) {
            context.imageRotationCenter = [context.imageSize[0] / 2, context.imageSize[1] / 2];
        }]
    })),
    some([
        every([
            state('svgImage'),
            evaluate(state => ({
                name: `createSVGSkin(${state.imageName})`,
                test: [function createSVGSkin (context) {
                    context.skinId = context.renderer.createSVGSkin(context.imageSource);
                    context.skin = context.renderer._allSkins[context.skinId];
                }]
            })),
            value('skin'),
            call('willEmitWasAltered'),
            call('didEmitWasAltered')
        ]),
        every([
            state('bitmapImage'),
            evaluate(state => ({
                name: `createBitmapSkin(${state.imageName})`,
                test: [function createBitmapSkin (context) {
                    context.skinId = context.renderer.createBitmapSkin(context.imageSource);
                    context.skin = context.renderer._allSkins[context.skinId];
                }]
            }))
        ])
    ])
]);

const rendererCreateSkin = every([
    call('renderer'),
    call('rendererNewSkin'),
    value('skin'),
    call('eventsMembers'),
    call('skinInitialMembers'),
    call('postAlterSkin')
]);

const rendererChangeSkin = every([
    evaluate({
        svgImage: false,
        bitmapImage: false
    }),
    call('createImage'),
    evaluate(state => ({
        imageRotationCenter: true,
        test: [function imageRotationCenter (context) {
            context.imageRotationCenter = [context.imageSize[0] / 2, context.imageSize[1] / 2];
        }]
    })),
    some([
        every([
            state('svgImage'),
            evaluate(state => ({
                name: `updateSVGSkin(${state.imageName})`,
                test: [function updateSVGSkin (context) {
                    context.renderer.updateSVGSkin(context.skinId, context.imageSource);
                    context.skin = context.renderer._allSkins[context.skinId];
                }]
            })),
            value('skin'),
            call('willEmitWasAltered'),
            call('didEmitWasAltered')
        ]),
        every([
            state('bitmapImage'),
            evaluate(state => ({
                name: `updateBitmapSkin(${state.imageName})`,
                test: [function updateBitmapSkin (context) {
                    context.renderer.updateBitmapSkin(context.skinId, context.imageSource);
                    context.skin = context.renderer._allSkins[context.skinId];
                }]
            }))
        ])
    ])
]);

const rendererUpdateSkin = every([
    rendererCreateSkin,
    rendererChangeSkin
]);

module.exports = {
    canvas,
    renderer,
    rendererNewSkin,
    rendererCreateSkin,
    rendererChangeSkin,
    rendererUpdateSkin
};
