import { BlockfrostPluts } from '@harmoniclabs/blockfrost-pluts';

class TokenMinterBlockfrostProvider extends BlockfrostPluts {
	async isStakeAddressRegistered(stakeAddr: string): Promise<boolean> {
		const res = await fetch(`${this.url}/accounts/${stakeAddr}`, {
			headers: { project_id: this.projectId },
		});
		if (res.status === 404) return false;
		if (!res.ok)
			throw new Error(
				`Blockfrost /accounts/${stakeAddr} failed: ${res.status} ${res.statusText}`
			);
		return true;
	}
}

const network = (import.meta.env.VITE_NETWORK ?? 'testnet') as 'testnet' | 'mainnet';
const customBackend = import.meta.env.VITE_BLOCKFROST_URL;
const projectId = import.meta.env.VITE_BLOCKFROST_PROJECT_ID;

if (!customBackend && !projectId) {
	throw new Error('Set VITE_BLOCKFROST_URL or VITE_BLOCKFROST_PROJECT_ID in .env.local');
}

const opts: any = { network };
if (customBackend) opts.customBackend = customBackend;
if (projectId) opts.projectId = projectId;

export const blockfrost = new TokenMinterBlockfrostProvider(opts);
