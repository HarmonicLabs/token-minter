import { useMemo, useState } from 'react';
import { useCardanoWallet } from 'use-cardano-wallet';
import { fromUtf8, fromHex } from '@harmoniclabs/uint8array-utils';
import { mintTokens } from '../minter/mintTokens';
import { tokenPolicy } from '../minter/tokenPolicy';

type Encoding = 'utf8' | 'hex';

interface AssetRow {
	id: number;
	name: string;
	encoding: Encoding;
	amount: string;
}

function decodeBytes(value: string, encoding: Encoding): Uint8Array {
	if (!value) return new Uint8Array();
	return encoding === 'hex' ? fromHex(value) : fromUtf8(value);
}

let nextRowId = 1;
function newRow(): AssetRow {
	return { id: nextRowId++, name: '', encoding: 'utf8', amount: '1000' };
}

export function MintForm() {
	const { isConnected, address, api } = useCardanoWallet();
	const [param, setParam] = useState('');
	const [paramEnc, setParamEnc] = useState<Encoding>('utf8');
	const [rows, setRows] = useState<AssetRow[]>(() => [newRow()]);
	const [busy, setBusy] = useState(false);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const policyId = useMemo(() => {
		try {
			const bytes = decodeBytes(param, paramEnc);
			if (bytes.length === 0) return null;
			return tokenPolicy(bytes).hash.toString();
		} catch {
			return null;
		}
	}, [param, paramEnc]);

	const rowsValid =
		rows.length > 0 &&
		rows.every((r) => r.name && /^\d+$/.test(r.amount) && BigInt(r.amount) > 0n);

	const canMint = isConnected && address && api && param && rowsValid && !busy;

	const updateRow = (id: number, patch: Partial<AssetRow>) =>
		setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
	const addRow = () => setRows((rs) => [...rs, newRow()]);
	const removeRow = (id: number) =>
		setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));

	const handleMint = async () => {
		if (!canMint) return;
		setBusy(true);
		setError(null);
		setTxHash(null);
		try {
			const paramBytes = decodeBytes(param, paramEnc);
			const assets = rows.map((r) => ({
				assetName: decodeBytes(r.name, r.encoding),
				amount: BigInt(r.amount),
			}));
			const hash = await mintTokens({
				param: paramBytes,
				assets,
				address: address!,
				api: api!,
			});
			setTxHash(hash);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			console.error('Mint failed:', e);
			setError(msg);
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="w-full max-w-xl bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-5">
			<div>
				<h2 className="text-xl font-semibold">Mint a token</h2>
				<p className="text-sm text-zinc-400 mt-1">
					Pick a policy parameter — it makes your policy id unique per deployment.
					Then mint any asset name and any quantity under that policy. Add multiple
					assets to mint them all in one transaction.
				</p>
			</div>

			<Field label="Policy parameter (bytestring)">
				<ValueWithEncoding
					value={param}
					onChange={setParam}
					encoding={paramEnc}
					onEncodingChange={setParamEnc}
					placeholder="e.g. MYTOKEN"
				/>
			</Field>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-zinc-400">Assets to mint</span>
					<button
						type="button"
						onClick={addRow}
						className="text-xs text-emerald-400 hover:text-emerald-300"
					>
						+ Add asset
					</button>
				</div>
				<div className="space-y-2">
					{rows.map((row) => (
						<AssetRowInput
							key={row.id}
							row={row}
							canRemove={rows.length > 1}
							onChange={(patch) => updateRow(row.id, patch)}
							onRemove={() => removeRow(row.id)}
						/>
					))}
				</div>
			</div>

			{policyId && (
				<div className="text-xs text-zinc-400">
					<div className="text-zinc-500">Derived policy id:</div>
					<div className="font-mono break-all text-emerald-400">{policyId}</div>
				</div>
			)}

			<button
				onClick={handleMint}
				disabled={!canMint}
				className={`w-full h-11 rounded-md font-semibold transition ${
					canMint
						? 'bg-emerald-500 hover:bg-emerald-400 text-black'
						: 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
				}`}
			>
				{busy ? 'Minting…' : isConnected ? 'Mint' : 'Connect a wallet to mint'}
			</button>

			{txHash && (
				<div className="text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-md p-3 break-all">
					<div className="font-medium">Tx submitted</div>
					<div className="font-mono text-xs mt-1">{txHash}</div>
				</div>
			)}

			{error && (
				<div className="text-sm bg-red-500/10 border border-red-500/30 text-red-300 rounded-md p-3 break-all">
					<div className="font-medium">Error</div>
					<div className="text-xs mt-1">{error}</div>
				</div>
			)}
		</div>
	);
}

function AssetRowInput({
	row,
	canRemove,
	onChange,
	onRemove,
}: {
	row: AssetRow;
	canRemove: boolean;
	onChange: (patch: Partial<AssetRow>) => void;
	onRemove: () => void;
}) {
	return (
		<div className="flex gap-2 items-start">
			<div className="flex-1 flex gap-2">
				<input
					type="text"
					value={row.name}
					onChange={(e) => onChange({ name: e.target.value })}
					placeholder="Asset name"
					className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm font-mono focus:border-emerald-500 outline-none"
				/>
				<select
					value={row.encoding}
					onChange={(e) => onChange({ encoding: e.target.value as Encoding })}
					className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-2 text-sm"
				>
					<option value="utf8">utf8</option>
					<option value="hex">hex</option>
				</select>
				<input
					type="text"
					inputMode="numeric"
					value={row.amount}
					onChange={(e) => onChange({ amount: e.target.value.replace(/[^\d]/g, '') })}
					placeholder="qty"
					className="w-24 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm font-mono focus:border-emerald-500 outline-none"
				/>
			</div>
			<button
				type="button"
				onClick={onRemove}
				disabled={!canRemove}
				aria-label="Remove asset"
				className="h-9 w-9 flex items-center justify-center rounded-md border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/40 disabled:opacity-30 disabled:cursor-not-allowed"
			>
				×
			</button>
		</div>
	);
}

function Field({
	label,
	children,
	rightSlot,
}: {
	label: string;
	children: React.ReactNode;
	rightSlot?: React.ReactNode;
}) {
	return (
		<label className="block">
			<div className="flex items-center justify-between mb-1.5">
				<span className="text-xs font-medium text-zinc-400">{label}</span>
				{rightSlot}
			</div>
			{children}
		</label>
	);
}

function ValueWithEncoding({
	value,
	onChange,
	encoding,
	onEncodingChange,
	placeholder,
	disabled,
}: {
	value: string;
	onChange: (v: string) => void;
	encoding: Encoding;
	onEncodingChange: (e: Encoding) => void;
	placeholder?: string;
	disabled?: boolean;
}) {
	return (
		<div className="flex gap-2">
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				disabled={disabled}
				className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm font-mono focus:border-emerald-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
			/>
			<select
				value={encoding}
				onChange={(e) => onEncodingChange(e.target.value as Encoding)}
				disabled={disabled}
				className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<option value="utf8">utf8</option>
				<option value="hex">hex</option>
			</select>
		</div>
	);
}
