import { useEffect, useRef, useState } from 'react';
import './styles/App.css';

interface StockData {
    symbol: string;
    price: number;
    time: string;
}

function App() {
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [status, setStatus] = useState('Waiting for live data...');
    const ws = useRef<WebSocket | null>(null);
    const reconnectInterval = useRef<number | null>(null);

    useEffect(() => {
        const connectWebSocket = () => {
            ws.current = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:4000');

            ws.current.onopen = () => {
                console.log('WebSocket connected');
                setStatus('🟢 Connected');
                if (reconnectInterval.current) {
                    clearInterval(reconnectInterval.current);
                    reconnectInterval.current = null;
                }
            };

            ws.current.onmessage = (event) => {
                try {
                    const incoming = JSON.parse(event.data);
                    setStockData({
                        symbol: incoming.symbol,
                        price: Number(incoming.price),
                        time: incoming.time || new Date().toISOString(),
                    });
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            };

            ws.current.onclose = () => {
                console.log('WebSocket disconnected, reconnecting in 5 seconds...');
                setStatus('🔴 Disconnected. Attempting to reconnect...');
                if (!reconnectInterval.current) {
                    reconnectInterval.current = setInterval(() => {
                        console.log(' Attempting WebSocket reconnection...');
                        connectWebSocket();
                    }, 5000);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                ws.current?.close();
            };
        };

        connectWebSocket();

        return () => {
            ws.current?.close();
            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current);
            }
        };
    }, []);

    return (
        <div className="app-container">
            <h1 className="app-title">📡 Live Financial Data</h1>
            <p className="status">{status}</p>
            {stockData ? (
                <>
                    <p className="app-symbol">Symbol: {stockData.symbol}</p>
                    <p className="app-price">Price: ${stockData.price.toFixed(2)}</p>
                    <p className="app-time">
                        Last updated: {stockData.time ? new Date(stockData.time).toLocaleTimeString() : 'N/A'}
                    </p>
                </>
            ) : (
                <p className="app-loading">Waiting for live data...</p>
            )}
        </div>
    );
}

export default App;