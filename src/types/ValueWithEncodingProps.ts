import { Encoding } from './Encoding';

export interface ValueWithEncodingProps {
	value: string;
	onChange: (v: string) => void;
	encoding: Encoding;
	onEncodingChange: (e: Encoding) => void;
	placeholder?: string;
	disabled?: boolean;
}
