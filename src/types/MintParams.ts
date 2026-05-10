import { WalletApi } from 'use-cardano-wallet';
import { MintAsset } from './MintAsset';

export interface MintParams {
	param: Uint8Array;
	assets: MintAsset[];
	address: string;
	api: WalletApi;
}
