const {some, evaluate, resolver, every, call, run, build, loadModule, buildPlan, afterEach} = require('../fixtures/declare-tests');
const {buildChromeless} = require('../fixtures/declare-chromeless');

const declareSkin = require('../fixtures/declare-Skin');

const newSkin = every([
    loadModule('Skin', './Skin.js'),
    call('skinId'),
    evaluate({
        name: 'new Skin',
        concreteSkin: false,
        test: [function newSkinTest (context) {
            context.value = context.skin = new context.module.Skin(context.skinId);
        }]
    })
]);

run(every([
    some([
        call('skin'),
        call('skinDispose')
    ]),
    buildChromeless,
    buildPlan(2)
]), {
    reports: [],
    resolver: resolver({
        ...declareSkin,
        newSkin,
    }),
});
