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
                setStatus('🔴 Disconnected. Attempting to reconnect...');
                if (!reconnectInterval.current) {
                    reconnectInterval.current = setInterval(connectWebSocket, 5000);
                }
            };

            ws.current.onerror = (error) => {
                console.warn('WebSocket encountered an error:', error);
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
        <div className="app-root">
            {/* Top Navigation */}
            <header className="top-nav">
                <div className="nav-container">
                    <h1 className="nav-title">📈 Financial Dashboard</h1>
                </div>
            </header>

            {/* Page Content */}
            <main className="app-container">

                {/* Chart Section */}
                <section className="chart-section">
                    <h2 className="chart-title">📊 Live Stock Chart</h2>
                    <div className="chart-placeholder">Chart goes here</div>
                </section>

                {/* Status + Live Data */}
                <h2 className="app-title">📡 Live Financial Data</h2>
                <p className="app-status">{status}</p>

                {stocks.length ? (
                    <div className="stock-grid">
                        {stocks.map((stock) => (
                            <div key={stock.symbol} className="stock-card">
                                <h2 className="stock-symbol">{stock.symbol}</h2>
                                <p className="stock-price">${stock.price.toFixed(2)}</p>
                                <p className="stock-time">
                                    Last updated:{' '}
                                    {stock.time
                                        ? new Date(stock.time).toLocaleTimeString()
                                        : 'N/A'}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="app-loading">Waiting for live data...</p>
                )}
            </main>
        </div>
    );
}

export default App;