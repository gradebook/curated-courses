// @ts-check
const fs = require('fs');
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const ENTRYPOINTS = fs.readdirSync('./src/scripts').filter(fileOrDir => fileOrDir !== 'components');
const entrypointCompilers = [];

const plugins = [
	resolve({browser: true}),
	commonjs(),
	production && terser()
];

for (const entrypoint of ENTRYPOINTS) {
	entrypointCompilers.push({
		input: `src/scripts/${entrypoint}`,
		output: {
			sourcemap: false,
			format: 'iife',
			name: entrypoint.replace(/-(.)/, (_, t) => t.toUpperCase()),
			file: `dist/script/${entrypoint}`
		},
		plugins
	});
}

export default entrypointCompilers;
