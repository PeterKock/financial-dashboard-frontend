import { useEffect, useRef, useState } from 'react';

interface Props {
    symbol: string;
    price: number;
    time: string;
    isActive: boolean;
    onClick: (symbol: string) => void;
}

export default function StockCard({ symbol, price, time, isActive, onClick }: Props) {
    const [flashClass, setFlashClass] = useState('');
    const prevPrice = useRef<number | null>(null);

    useEffect(() => {
        if (prevPrice.current !== null) {
            if (price > prevPrice.current) {
                setFlashClass('flash-green');
            } else if (price < prevPrice.current) {
                setFlashClass('flash-red');
            }

            const timeout = setTimeout(() => setFlashClass(''), 500);
            return () => clearTimeout(timeout);
        }

        prevPrice.current = price;
    }, [price]);

    return (
        <div
            className={`stock-card ${isActive ? 'stock-card-active' : ''} ${flashClass}`}
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