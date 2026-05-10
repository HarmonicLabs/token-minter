import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		dedupe: [
			'@harmoniclabs/cardano-ledger-ts',
			'@harmoniclabs/buildooor',
			'@harmoniclabs/plutus-data',
			'@harmoniclabs/cbor',
			'@harmoniclabs/uint8array-utils',
		],
	},
	optimizeDeps: {
		include: [
			'@harmoniclabs/cardano-ledger-ts',
			'@harmoniclabs/buildooor',
			'@harmoniclabs/blockfrost-pluts',
			'@harmoniclabs/plutus-data',
			'@harmoniclabs/cbor',
		],
	},
	server: { port: 5173 },
});
