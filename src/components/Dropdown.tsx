interface Props {
    options: string[];
    selected: string;
    onSelect: (symbol: string) => void;
}

export default function Dropdown({ options, selected, onSelect }: Props) {
    return (
        <div className="symbol-selector">
            <label htmlFor="symbol-select" className="dropdown-label">
            </label>
            {options.length === 0 ? (
                <select disabled className="dropdown">
                    <option>Loading...</option>
                </select>
            ) : (
                <select
                    id="symbol-select"
                    value={selected}
                    onChange={(e) => onSelect(e.target.value)}
                    className="dropdown"
                >
                    {options.map((symbol) => (
                        <option key={symbol} value={symbol}>
                            {symbol}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}