const {optional, state, evaluate, not, resolver, some, every, call, run, build, loadModule, buildPlan, afterEach} = require('../fixtures/declare-tests');
const {buildChromeless} = require('../fixtures/declare-chromeless');

const declareAssets = require('../fixtures/declare-assets');
const declareRenderWebGL = require('../fixtures/declare-RenderWebGL');
const declareSkin = require('../fixtures/declare-Skin');

const newBitmapSkin = every([
    call('renderer'),
    call('skinId'),
    loadModule('BitmapSkin', './BitmapSkin.js'),
    evaluate({
        concreteSkin: true,
        name: 'new BitmapSkin',
        test: [function newBitmapSkin (context) {
            context.value = context.skin = new context.module.BitmapSkin(context.skinId, context.renderer);
        }]
    })
]);

const newSkin = newBitmapSkin;

const setBitmap = every([
    state('bitmapImage'),
    not(state('svgImage')),
    some([
        evaluate(state => ({
            imageRotationCenter: true,
            name: `setBitmap(${state.imageName})`,
            test: [function setBitmap (context) {
                context.imageResolution = 2;
                context.imageRotationCenter = context.imageSize.map(dim => dim / 2);
                context.skin.setBitmap(context.imageSource);
            }]
        })),
        evaluate(state => ({
            imageRotationCenter: true,
            name: `setBitmap(${state.imageName}, 2, [10, 10])`,
            test: [function setBitmap_rotationCenter (context) {
                context.imageResolution = 2;
                context.imageRotationCenter = [10, 10];
                context.skin.setBitmap(context.imageSource, context.imageResolution, [10, 10]);
            }]
        }))
    ])
]);

const setImage = setBitmap;

run(every([
    some([
        every([
            evaluate({everyImageLoader: true}),
            call('skin'),
        ]),
        call('skinDispose'),
        every([
            evaluate({everyBitmap: true}),
            call('skinUpdate')
        ])
    ]),
    buildChromeless,
    buildPlan(82)
]), {
    reports: [],
    resolver: resolver({
        ...declareRenderWebGL,
        ...declareSkin,
        ...declareAssets,
        setImage,
        newSkin,
    }),
});
