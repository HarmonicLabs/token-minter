import { compile } from '@harmoniclabs/plu-ts';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { toHex } from '@harmoniclabs/uint8array-utils';
import { tokenPolicyContract } from './tokenPolicy';

void (async function main() {
	const outDir = '../out';
	if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

	const path = outDir + '/tokenPolicy.precompiled.uplc';
	console.log('compiling: ' + path);
	console.time('compilation');
	const compiled = compile(tokenPolicyContract);
	console.timeEnd('compilation');
	console.log('uplc: ' + toHex(compiled));
	await writeFile(path, compiled);
	console.log('wrote ' + path);
})();
