import { WalletConnect } from './components/WalletConnect';
import { MintForm } from './components/MintForm';

export default function App() {
	return (
		<div className="min-h-screen w-full flex flex-col">
			<header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
				<h1 className="text-lg font-semibold tracking-tight">Token Minter</h1>
				<WalletConnect />
			</header>
			<main className="flex-1 flex items-start justify-center p-6">
				<MintForm />
			</main>
		</div>
	);
}
