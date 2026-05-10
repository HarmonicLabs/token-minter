import {
	TermFn,
	PByteString,
	PScriptContext,
	PUnit,
	pfn,
	bs,
	unit,
	pmakeUnit,
} from '@harmoniclabs/plu-ts';

export const tokenPolicyContract: TermFn<[PByteString, typeof PScriptContext], PUnit> = pfn(
	[bs, PScriptContext.type],
	unit
)((_tokenName, _ctx) => pmakeUnit());
