// Based on https://github.com/gruhn/vue-qrcode-reader/blob/bf32fa0b4b9c3473949a68d629b784ce04c96477/src/misc/image-data.js

const canvas = document.createElement('canvas');
const canvasCtx = canvas.getContext('2d');

canvas.width = 1920;
canvas.height = 1080;

// Based on https://github.com/gruhn/callforth/blob/master/src/callforth.js
const waitFor = (eventTarget, successEvent, errorEvent = 'error') => {
	let resolve;
	let reject;

	// eslint-disable-next-line promise/param-names
	const promise = new Promise((res, rej) => { // eslint-disable-line unicorn/prevent-abbreviations
		resolve = res;
		reject = rej;
	});

	eventTarget.addEventListener(successEvent, resolve);
	eventTarget.addEventListener(errorEvent, reject);

	promise.finally(() => {
		eventTarget.removeEventListener(successEvent, resolve);
		eventTarget.removeEventListener(errorEvent, reject);
	});

	return promise;
};

async function imageDataFromUrl(url) {
	const image = document.createElement('img');
	image.src = url;

	await waitFor(image, 'load');

	const {width, height} = image;
	const scalingRatio = Math.min(1, canvas.width / width, canvas.height / height);
	const scaledW = scalingRatio * width;
	const scaledH = scalingRatio * height;

	canvasCtx.drawImage(image, 0, 0, scaledW, scaledH);

	return canvasCtx.getImageData(0, 0, scaledW, scaledH);
}

export async function imageDataFromFile(file) {
	const reader = new FileReader();

	reader.readAsDataURL(file);

	const result = await waitFor(reader, 'load');
	const dataURL = result.target.result;

	return imageDataFromUrl(dataURL);
}
