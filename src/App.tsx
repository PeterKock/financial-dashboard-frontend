import { useEffect, useState } from 'react';
import './styles/App.css';

interface StockData {
    symbol: string;
    price: string;
    time?: string;
}

function App() {
    const [data, setData] = useState<StockData | null>(null);

    useEffect(() => {
        const socket = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:4000');

        socket.onmessage = (event) => {
            try {
                const incoming = JSON.parse(event.data);
                setData({
                    symbol: incoming.symbol,
                    price: incoming.price,
                    time: new Date().toISOString() // fallback if backend doesn't provide a timestamp
                });
            } catch (err) {
                console.error('Error parsing message:', err);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            socket.close();
        };
    }, []);

    return (
        <div className="app-container">
            <h1 className="app-title">📡 Live Financial Data</h1>
            {data ? (
                <>
                    <p className="app-symbol">Symbol: {data.symbol}</p>
                    <p className="app-price">Price: ${Number(data.price).toFixed(2)}</p>
                    <p className="app-time">
                        Last updated: {data.time ? new Date(data.time).toLocaleTimeString() : 'N/A'}
                    </p>
                </>
            ) : (
                <p className="app-loading">Waiting for live data...</p>
            )}
        </div>
    );
}

export default App;
