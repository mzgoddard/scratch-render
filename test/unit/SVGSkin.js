const {optional, state, evaluate, not, resolver, some, every, call, run, build, loadModule, buildPlan, afterEach} = require('../fixtures/declare-tests');
const {buildChromeless} = require('../fixtures/declare-chromeless');

const {loadSVG} = require('../fixtures/declare-assets');
const declareRenderWebGL = require('../fixtures/declare-RenderWebGL');
const declareSkin = require('../fixtures/declare-Skin');

const newSVGSkin = every([
    call('renderer'),
    call('skinId'),
    loadModule('SVGSkin', './SVGSkin.js'),
    evaluate({
        concreteSkin: true,
        name: 'new SVGSkin',
        test: [function newSVGSkin (context) {
            context.value = context.skin = new context.module.SVGSkin(context.skinId, context.renderer);
        }]
    })
]);

const newSkin = newSVGSkin;

const createSVG = some([
    loadSVG('orange50x50.svg', [50, 50]),
    loadSVG('purple100x100.svg', [100, 100]),
    loadSVG('gradient50x50.svg', [50, 50]),
    loadSVG('gradient100x100.svg', [100, 100])
]);

const createImage = createSVG;

const setSVG = every([
    optional(state('imageRotationCenter'),
        evaluate({
            oldImageRotationCenter: true,
            test: [function setOldImageRotationCenter (context) {
                context.oldImageRotationCenter = context.imageRotationCenter;
            }]
        })
    ),
    some([
        evaluate(state => ({
            imageRotationCenter: true,
            name: `setSVG(${state.imageName})`,
            test: [function setSVG (context) {
                context.imageRotationCenter = context.imageSize.map(dim => dim / 2);
                context.skin.setSVG(context.imageSource);
            }]
        })),
        evaluate(state => ({
            imageRotationCenter: true,
            name: `setSVG(${state.imageName}, [10, 10])`,
            test: [function setSVG_rotationCenter (context) {
                context.imageRotationCenter = [10, 10];
                context.skin.setSVG(context.imageSource, [10, 10]);
            }]
        }))
    ])
]);

const setImage = setSVG;

const getTexture = every([
    evaluate({scale: 1}),
    declareSkin.getTexture,
    evaluate({scale: 2}),
    declareSkin.getTexture
]);

run(every([
    some([
        call('skinDispose'),
        call('skinUpdate')
    ]),
    buildChromeless,
    buildPlan(81)
]), {
    reports: [],
    resolver: resolver({
        ...declareRenderWebGL,
        ...declareSkin,
        createImage,
        setImage,
        newSkin,
        getTexture
    }),
});
