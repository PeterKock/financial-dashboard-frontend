import { useEffect, useRef, useState } from 'react';
import './styles/App.css';
import Layout from './layout/Layout';
import StatusBanner from './components/StatusBanner';
import StockCard from './components/StockCard';

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
        <Layout>
            {/* Chart Section */}
            <StatusBanner status={status} />
            <section className="chart-section">
                <h2 className="chart-title">Live Stock Chart</h2>
                <div className="chart-placeholder">Chart goes here</div>
            </section>

            {/* Status + Live Data */}
            <h2 className="app-title">Live Financial Data</h2>

            {stocks.length ? (
                <div className="stock-grid">
                    {stocks.map((stock) => (
                        <StockCard
                            key={stock.symbol}
                            symbol={stock.symbol}
                            price={stock.price}
                            time={stock.time}
                        />
                    ))}
                </div>
            ) : (
                <p className="app-loading">Waiting for live data...</p>
            )}
        </Layout>
    );
}

export default App;