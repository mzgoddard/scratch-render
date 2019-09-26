const {or, add, resolver, and, call, run, build, loadModule, buildPlan, afterEach} = require('../fixtures/declare-tests');
const {buildChromeless} = require('../fixtures/declare-chromeless');

const declareSkin = require('../fixtures/declare-Skin');

const newSkin = and([
    loadModule('Skin', './Skin.js'),
    call('skinId'),
    add({
        concreteSkin: false,
        test: [function newSkinTest (context) {
            context.value = context.skin = new context.module.Skin(context.skinId);
        }]
    })
]);

run(and([
    or([
        call('skin'),
        call('skinDispose')
    ]),
    buildChromeless,
    buildPlan(2)
])({
    reports: [],
    resolver: resolver({
        ...declareSkin,
        newSkin,
    }),
}, afterEach, buildPlan.end));
