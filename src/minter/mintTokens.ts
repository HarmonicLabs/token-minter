import {
	Address,
	DataI,
	ITxBuildMint,
	TxBuilder,
	TxOut,
	Value,
	UTxO,
	toHex,
	TxWitnessSet,
} from '@harmoniclabs/buildooor';
import { WalletApi } from 'use-cardano-wallet';
import { blockfrost } from '../lib/blockfrost';
import { tokenPolicy } from './tokenPolicy';

export interface MintAsset {
	assetName: Uint8Array;
	amount: bigint;
}

export interface MintParams {
	param: Uint8Array;
	assets: MintAsset[];
	address: string;
	api: WalletApi;
}

export async function mintTokens({
	param,
	assets,
	address,
	api,
}: MintParams): Promise<string> {
	if (assets.length === 0) throw new Error('At least one asset required');
	console.log('Starting token minting process...');
	const recipient = Address.fromString(address);
	const script = tokenPolicy(param);

	const [pps, gInfos, inputs] = await Promise.all([
		blockfrost.getProtocolParameters(),
		blockfrost.getGenesisInfos(),
		blockfrost.addressUtxos(recipient),
	]);
	const txBuilder = new TxBuilder(pps, gInfos);

	const adaInputsOnly = inputs.filter((u: UTxO) => Value.isAdaOnly(u.resolved.value));
	const nonCollateralUtxos = inputs.filter((u: UTxO) => !Value.isAdaOnly(u.resolved.value));
	const collaterals = inputs.find((u: UTxO) => u.resolved.value.lovelaces >= 5_000_000n && Value.isAdaOnly(u.resolved.value));
	const faucetInputs = inputs.filter(	(u: UTxO) => u.resolved.value.lovelaces >= 10_000_000n && Value.isAdaOnly(u.resolved.value));

	if (!collaterals) {
		console.log(
			'No suitable collateral UTxO found (need an ada-only input with >= 5 ADA).'
		);
	}

	const mintValue = assets
		.map((a) => Value.singleAsset(script.hash, a.assetName, a.amount))
		.reduce((acc, v) => Value.add(acc, v));

	console.log({
		policyId: script.hash.toString(),
		assets: assets.map((a) => ({
			assetNameHex: toHex(a.assetName),
			amount: a.amount.toString(),
		})),
	});

	const mints: ITxBuildMint[] = [
		{
			value: mintValue,
			script: {
				inline: script,
				redeemer: new DataI(0),
			},
		},
	];

	const outputs = [
		new TxOut({
			address: recipient,
			value: Value.add(Value.lovelaces(2_000_000), mintValue),
		}),
	];

	const tx = txBuilder.buildSync({
		inputs: [...adaInputsOnly, ...nonCollateralUtxos],
		mints,
		outputs,
		changeAddress: recipient,
		invalidBefore: 20,
		collaterals: [collaterals],
	});

	const txCborHex = toHex(tx.toCbor());

	const signedWitnessHex = await api.signTx(txCborHex, true);
	if (!signedWitnessHex) throw new Error('Failed to sign transaction');

	const wits = TxWitnessSet.fromCbor(signedWitnessHex);
	if (wits.vkeyWitnesses?.length) {
		for (const wit of wits.vkeyWitnesses) {
			tx.addVKeyWitness(wit);
		}
	}

	const submitTxRes = await api.submitTx(toHex(tx.toCbor()));
	if (!submitTxRes) throw new Error('Failed to submit transaction');

	console.log('Transaction submitted successfully! Tx hash:', submitTxRes);
	return submitTxRes;
}
