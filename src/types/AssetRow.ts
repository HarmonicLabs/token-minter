import { Encoding } from './Encoding';

export interface AssetRow {
	id: number;
	name: string;
	encoding: Encoding;
	amount: string;
}
