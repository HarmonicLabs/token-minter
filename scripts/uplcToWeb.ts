import { readFile, writeFile } from 'fs/promises';
import { compileUPLC, parseUPLC, Script } from '@harmoniclabs/buildooor';

const tokenPolicyBytes = new Uint8Array(await readFile('./out/tokenPolicy.precompiled.uplc'));

const data = {
	tokenPolicy: Array.from(tokenPolicyBytes),
};

const tokenPolicyHash = Script.plutusV3(compileUPLC(parseUPLC(tokenPolicyBytes)));
console.log('tokenPolicyHash (un-applied): ', tokenPolicyHash.hash.toString());

await writeFile('./out/scripts.json', JSON.stringify(data, null, 2));
console.log('wrote ./out/scripts.json');
