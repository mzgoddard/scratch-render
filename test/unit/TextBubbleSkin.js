const {optional, state, evaluate, not, resolver, some, every, call, run, build, loadModule, buildPlan, afterEach, value} = require('../fixtures/declare-tests');
const {buildChromeless} = require('../fixtures/declare-chromeless');

const declareAssets = require('../fixtures/declare-assets');
const declareRenderWebGL = require('../fixtures/declare-RenderWebGL');
const declareSkin = require('../fixtures/declare-Skin');

const newTextBubbleSkin = every([
    call('renderer'),
    call('skinId'),
    loadModule('TextBubbleSkin', './TextBubbleSkin.js'),
    evaluate({
        concreteSkin: true,
        name: 'new TextBubbleSkin',
        test: [function newTextBubbleSkin (context) {
            context.value = context.skin = new context.module.TextBubbleSkin(context.skinId, context.renderer);
        }]
    })
]);

const newSkin = newTextBubbleSkin;

const setTextBubble = every([
    state('textBubble', bubble => Boolean(bubble)),
    some([
        evaluate(({textBubble: {type, text, pointsLeft}}) => ({
            name: `setTextBubble(${type}, ${text.length > 20 ? `${text.substring(0, 20).replace(/\n/g, '\\n')}...` : text.replace(/\n/g, '\\n')}, ${pointsLeft})`,
            test: [function setTextBubble (context) {
                const {type, text, pointsLeft} = context.textBubble;
            context.skin.setTextBubble(type, text, pointsLeft);
            }]
        }))
    ])
]);

const setImage = setTextBubble;

run(every([
    some([
        call('skinDispose'),
        every([
            evaluate({everyTextBubble: true}),
            call('skinUpdate')
        ])
    ]),
    buildChromeless,
    buildPlan(92)
]), {
    reports: [],
    resolver: resolver({
        ...declareRenderWebGL,
        ...declareSkin,
        ...declareAssets,
        setImage,
        newSkin
    }),
});
