interface Props {
    symbol: string;
    price: number;
    time: string;
}

export default function StockCard({ symbol, price, time }: Props) {
    return (
        <div className="stock-card">
            <h2 className="stock-symbol">{symbol}</h2>
            <p className="stock-price">${price.toFixed(2)}</p>
            <p className="stock-time">
                Last updated: {time ? new Date(time).toLocaleTimeString() : 'N/A'}
            </p>
        </div>
    );
}