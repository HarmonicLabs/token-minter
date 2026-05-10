import { useState } from 'react';
import { useCardanoWallet, WalletName } from 'use-cardano-wallet';

export function WalletConnect() {
	const { connect, disconnect, isConnected, address, connectedWallet, detectedWallets } =
		useCardanoWallet();
	const [open, setOpen] = useState(false);

	if (isConnected && address) {
		const short = `${address.slice(0, 8)}…${address.slice(-6)}`;
		return (
			<div className="flex items-center gap-3">
				<span className="text-xs font-mono text-emerald-400">{short}</span>
				<span className="text-xs text-zinc-500">{connectedWallet?.name}</span>
				<button
					onClick={() => disconnect()}
					className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 hover:border-zinc-500"
				>
					Disconnect
				</button>
			</div>
		);
	}

	return (
		<div className="relative">
			<button
				onClick={() => setOpen((o) => !o)}
				className="text-sm px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black font-medium"
			>
				Connect Wallet
			</button>
			{open && (
				<div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg z-10 p-2">
					{detectedWallets.length === 0 ? (
						<p className="text-xs text-zinc-500 p-3">No CIP-30 wallets detected.</p>
					) : (
						detectedWallets.map(
							(w: { name: WalletName; displayName: string; icon?: string }) => (
								<button
									key={w.name}
									onClick={async () => {
										try {
											await connect(w.name);
											setOpen(false);
										} catch (e) {
											console.error('Wallet connect failed:', e);
										}
									}}
									className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-800 text-left"
								>
									{w.icon && (
										<img src={w.icon} alt={w.name} width={24} height={24} />
									)}
									<span className="text-sm">{w.displayName}</span>
								</button>
							)
						)
					)}
				</div>
			)}
		</div>
	);
}
