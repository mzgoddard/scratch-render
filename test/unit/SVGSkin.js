const newSVGSkin = and([
    skinId,
    renderer,
    add({
        test: function ({context}) {
            context.value = context.skin = new SVGSkin(context.skinId, context.renderer);
        }
    })
])

const newSkin = or([
    newBaseSkin,
    newSVGSkin
])

const createImage = or([
    and([
        bitmapSkin,
        createBitmap
    ]),
    and([
        svgSkin,
        createSVG
    ])
])

const setImage = or([
    and([
        bitmapSkin,
        setBitmap
    ]),
    and([
        svgSkin,
        setSVG
    ])
])
