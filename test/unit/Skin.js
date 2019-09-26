const {add, resolver, and, call, run, build, loadModule, buildPlan, afterEach} = require('../fixtures/declare-tests');
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
    call('skin'),
    buildChromeless,
    buildPlan(1)
])({
    reports: [],
    resolver: resolver({
        ...declareSkin,
        newSkin,
    }),
}, afterEach, buildPlan.end));
