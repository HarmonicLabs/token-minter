import { WalletName } from 'use-cardano-wallet';

export interface DetectedWallet {
	name: WalletName;
	displayName: string;
	icon?: string;
}
