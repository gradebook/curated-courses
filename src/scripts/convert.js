// @ts-check

import {deserialize} from '@gradebook/course-serializer';
import jsqr from 'jsqr';
import {imageDataFromFile} from './components/img-data-from-file';
import {yamlize} from './components/yamlize';

const form = document.querySelector('#share-link-wrapper');
const errorElement = form.querySelector('.error-message');
/** @type {HTMLInputElement} */
const urlElement = form.querySelector('#link');
const outputElement = document.querySelector('#converted-payload');
const metaElement = document.querySelector('.conversion-meta');

const handleProcessCompletion = (output, error = null) => {
	if (output) {
		const {data, source} = output;
		errorElement.textContent = '';
		outputElement.textContent = data;
		metaElement.textContent = `Source: ${source}`;
	} else {
		errorElement.textContent = error || 'It looks like the URL you supplied is invalid';
		outputElement.textContent = '';
	}
};

/**
 * @param {string} hash
 * @param {string} source
*/
function handleHash(hash, source) {
	if (hash.startsWith('#')) {
		hash = hash.slice(1);
	}

	const payload = deserialize(hash);
	try {
		handleProcessCompletion({
			source,
			data: yamlize(payload)
		});
	} catch {
		handleProcessCompletion(null);
	}
}

/**
 * @param {string} url
 * @param {string} source
 */
function renderUrl(url, source) {
	try {
		const parsedURL = new URL(url);
		if (!parsedURL.hash) {
			handleProcessCompletion(null);
			return;
		}

		handleHash(parsedURL.hash, source);
	} catch {
		handleProcessCompletion(null);
	}
}

function bootstrapForm() {
	form.addEventListener('submit', event => {
		event.preventDefault();
		const {value: url} = urlElement;
		if (!url) {
			return;
		}

		renderUrl(url, 'form');
	});
}

function bootstrapDragDrop() {
	const {body} = document;
	document.addEventListener('drop', async event => {
		event.preventDefault();
		body.classList.remove('dragging');
		let error = null;

		const {items, files} = event.dataTransfer;

		if (items.length > 1) {
			if (items[0].type.startsWith('text')) {
				return;
			}

			error = 'Cannot process more than 1 file';
		} else if (!items[0].type.startsWith('image')) {
			error = 'File must be an image';
		}

		if (error) {
			handleProcessCompletion(null, error);
			return;
		}

		const {width, height, data} = await imageDataFromFile(files[0]);
		const qrData = jsqr(data, width, height);

		if (!qrData) {
			return handleProcessCompletion(null, 'Unable to find QR code in image');
		}

		renderUrl(qrData.data, `File (${files[0].name})`);
	});

	document.addEventListener('dragover', event => {
		if (event.dataTransfer.items[0].type.startsWith('image')) {
			event.preventDefault();
			body.classList.add('dragging');
		}
	});

	document.addEventListener('dragleave', event => {
		event.preventDefault();
		body.classList.remove('dragging');
	});
}

bootstrapDragDrop();
bootstrapForm();
