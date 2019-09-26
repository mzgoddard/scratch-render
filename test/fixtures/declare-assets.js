const {pass, or, and, add, optional, state} = require('./declare-tests');

async function loadAsset_fetch (context, name) {
    context.assetResponse = await fetch(`./assets/${name}`);
    return [
        ['comment', `fetch('./assets/${name}')`],
        ['equal', typeof context.assetResponse, 'object', 'sent asset request']
    ];
}

const loadAsset = function (name) {
    return add({
        plan: 1,
        assetName: name,
        test: [loadAsset_fetch, name]
    });
};

function storeImageSize (context, size) {
    context.imageSize = size;
}

const imageSize = function (size) {
    return add({
        imageSize: true,
        test: [storeImageSize, size]
    });
};

async function loadPNG_arrayBuffer (context) {
    context.imageSourceBuffer = await context.assetResponse.arrayBuffer();
    context.imageSourceBlob = new Blob([context.imageSourceBuffer], {type: 'image/png'});
    return [
        ['equal', typeof context.imageSourceBuffer, 'object', 'loaded png buffer']
    ];
}

async function loadPNG_image (context) {
    context.imageSource = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(context.imageSourceBlob);
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
    return [
        ['ok', context.imageSource instanceof Image, 'loaded png image']
    ];
}

async function loadPNG_canvas (context) {
    const imageCanvas = document.createElement('canvas');
    const imageContext = imageCanvas.getContext('2d');
    imageCanvas.width = context.imageSource.width;
    imageCanvas.height = context.imageSource.height;
    imageContext.drawImage(context.imageSource, 0, 0, imageCanvas.width, imageCanvas.height);
    context.imageSource = imageCanvas;
    return [
        ['ok', context.imageSource instanceof HTMLCanvasElement, 'rendered image into canvas']
    ];
}

async function loadPNG_imageBitmap (context) {
    context.imageSource = await createImageBitmap(context.imageSourceBlob);
    return [
        ['equal', typeof context.imageSource, 'object', 'loaded png imageBitmap']
    ];
}

const loadPNG = function (name, size) {
    return and([
        loadAsset(name),
        imageSize(size),
        add({imageName: name}),
        add({
            plan: 1,
            test: [loadPNG_arrayBuffer]
        }),
        or([
            and([
                state('eachPNG'),
                add({
                    plan: 1,
                    name: 'new Image',
                    test: [loadPNG_image]
                }),
                or([
                    pass,
                    add({
                        plan: 1,
                        name: 'HTMLCanvasElement',
                        test: [loadPNG_canvas]
                    })
                ])
            ]),
            add({
                plan: 1,
                name: 'createImageBitmap',
                test: [loadPNG_imageBitmap]
            })
        ])
    ]);
};

async function loadSVG_text (context) {
    context.imageSource = await context.assetResponse.text();
    return [
        ['equal', typeof context.imageSource, 'string', 'loaded svg string']
    ];
}

const loadSVG = function (name, size) {
    return and([
        loadAsset(name),
        imageSize(size),
        add({
            plan: 1,
            imageName: name,
            test: [loadSVG_text]
        })
    ]);
};

module.exports = {
    loadPNG,
    loadSVG
};
