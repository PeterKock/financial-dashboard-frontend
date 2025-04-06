interface Props {
    symbol: string;
    price: number;
    time: string;
    isActive: boolean;
    onClick: (symbol: string) => void;
}

export default function StockCard({ symbol, price, time, isActive, onClick }: Props) {
    return (
        <div
            className={`stock-card cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-green-400 ring-offset-2' : ''
            }`}
            onClick={() => onClick(symbol)}
        >
            <h2 className="stock-symbol">{symbol}</h2>
            <p className="stock-price">${price.toFixed(2)}</p>
            <p className="stock-time">
                Last updated: {time ? new Date(time).toLocaleTimeString() : 'N/A'}
            </p>
        </div>
    );
}
