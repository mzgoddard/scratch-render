const {state, fail, didEmitEvent, and, get, add, call, willEmitEvent, or, pass} = require('./declare-tests');

const concrete = state('concreteSkin');
const createImage = fail;
// const didEmitWasAltered = didEmitEvent('WasAltered');
const didEmitWasAltered = pass;
const eventsMembers = and([
    get('on'),
    get('off')
]);
const newSkin = call('newSkin');
const setImage = fail;
const skinId = add({
    test: [function skinIdTest (context) {
        context.skinId = Math.random().toString().slice(2);
    }]
});
const skinInitialMembers = and([
    get('id'),
    get('rotationCenter'),
    add({
        plan: 1,
        test: [function rotationCenterIsArray (context) {
            return [['ok', context.value.rotationCenter.length >= 2]];
        }]
    })
]);
// const willEmitWasAltered = willEmitEvent('WasAltered');
const willEmitWasAltered = pass;

const postChangeSkin = and([
    get('size'),
    state('imageSize'),
    add({
        plan: 1,
        test: [function skinSize (context) {
            const {size} = context.skin;
            return [['same',
                [Math.ceil(size[0]), Math.ceil(size[1])],
                context.imageSize]];
        }]
    }),
    get('rotationCenter'),
    state('imageRotationCenter'),
    add({
        plan: 1,
        test: [function skinRotationCenter (context) {
            const {rotationCenter} = context.skin;
            return [['same',
                [Math.ceil(rotationCenter[0]), Math.ceil(rotationCenter[1])],
                context.imageRotationCenter]];
        }]
    })
]);

const postAlterSkin = and([
    get('size'),
    get('rotationCenter')
]);

const changeSkin = and([
    call('concrete'),
    call('willEmitWasAltered'),
    call('createImage'),
    call('setImage'),
    call('postChangeSkin'),
    call('didEmitWasAltered'),
    call('postAlterSkin')
])

const skin = or([
    and([
        newSkin,
        call('eventsMembers'),
        call('skinInitialMembers')
    ]),
    and([
        newSkin,
        changeSkin,
    ])
])

const skinUpdate = or([
    skin,
    and([
        skin,
        changeSkin
    ])
])

module.exports = {
    changeSkin,
    concrete,
    createImage,
    didEmitWasAltered,
    eventsMembers,
    newSkin,
    postAlterSkin,
    postChangeSkin,
    setImage,
    skin,
    skinId,
    skinInitialMembers,
    skinUpdate,
    willEmitWasAltered
};
