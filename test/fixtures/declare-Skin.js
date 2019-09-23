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
    test: function(context) {
        context.skinId = Math.random().toString().slice(2);
    }
});
const skinInitialMembers = and([
    get('id'),
    get('rotationCenter')
]);
// const willEmitWasAltered = willEmitEvent('WasAltered');
const willEmitWasAltered = pass;

const postChangeSkin = and([
    get('size'),
    get('rotationCenter')
]);

const postAlterSkin = and([
    get('size'),
    get('rotationCenter')
]);

const changeSkin = and([
    concrete,
    willEmitWasAltered,
    createImage,
    setImage,
    postChangeSkin,
    didEmitWasAltered,
    postAlterSkin
])

const skin = or([
    and([
        newSkin,
        eventsMembers,
        skinInitialMembers
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
