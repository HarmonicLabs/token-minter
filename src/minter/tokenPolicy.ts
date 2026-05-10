import {
	Application,
	compileUPLC,
	parseUPLC,
	Script,
	UPLCConst,
	UPLCProgram,
} from '@harmoniclabs/buildooor';
import tokenPolicyUplcBytes from '../../out/scripts.json';

export function tokenPolicy(param: Uint8Array): Script {
	const bytes = new Uint8Array(tokenPolicyUplcBytes.tokenPolicy);

	const program = parseUPLC(bytes);
	const version = program.version;
	let body = program.body;
	body = new Application(body, UPLCConst.byteString(new Uint8Array(param)));

	return Script.plutusV3(compileUPLC(new UPLCProgram(version, body)));
}
