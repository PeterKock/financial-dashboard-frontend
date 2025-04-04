import { useEffect, useRef, useState } from 'react';
import './styles/App.css';

interface StockData {
    symbol: string;
    price: number;
    time: string;
}

type Stocks = StockData[];

function App() {
    const [stocks, setStocks] = useState<Stocks>([]);
    const [status, setStatus] = useState('🟡 Waiting for live data...');
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
                    const incoming: Stocks = JSON.parse(event.data);
                    setStocks(incoming);
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            };

            ws.current.onclose = () => {
                console.log('WebSocket disconnected, reconnecting in 5 seconds...');
                setStatus('🔴 Disconnected. Attempting to reconnect...');
                if (!reconnectInterval.current) {
                    reconnectInterval.current = setInterval(connectWebSocket, 5000);
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
            <p className="status mb-4">{status}</p>

            {stocks.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {stocks.map((stock) => (
                        <div key={stock.symbol} className="p-4 shadow rounded-lg bg-gray-800">
                            <h2 className="font-bold text-xl text-green-400">{stock.symbol}</h2>
                            <p className="text-2xl font-semibold text-yellow-400">
                                ${stock.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400">
                                Last updated:{' '}
                                {stock.time ? new Date(stock.time).toLocaleTimeString() : 'N/A'}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="app-loading">Waiting for live data...</p>
            )}
        </div>
    );
}

export default App;