interface Props {
    options: string[];
    selected: string[];
    onSelect: (symbols: string[]) => void;
}

export default function Dropdown({ options, selected, onSelect }: Props) {
    const toggleSymbol = (symbol: string) => {
        if (selected.includes(symbol)) {
            onSelect(selected.filter((s) => s !== symbol));
        } else {
            onSelect([...selected, symbol]);
        }
    };

    return (
        <div className="symbol-selector">
            <div className="dropdown-box">
                {options.map((symbol) => (
                    <div key={symbol} className="dropdown-option">
                        <input
                            type="checkbox"
                            id={`checkbox-${symbol}`}
                            name={`symbol-${symbol}`}
                            checked={selected.includes(symbol)}
                            onChange={() => toggleSymbol(symbol)}
                            className="dropdown-checkbox"
                        />
                        <label
                            htmlFor={`checkbox-${symbol}`}
                            className="dropdown-option-label"
                        >
                            {symbol}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}