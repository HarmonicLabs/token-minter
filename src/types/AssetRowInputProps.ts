import { AssetRow } from './AssetRow';

export interface AssetRowInputProps {
	row: AssetRow;
	canRemove: boolean;
	onChange: (patch: Partial<AssetRow>) => void;
	onRemove: () => void;
}
