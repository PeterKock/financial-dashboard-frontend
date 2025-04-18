import { useEffect, useRef, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Layout from './layout/Layout';
import StatusBanner from './components/StatusBanner';
import Dropdown from './components/Dropdown';
import StockCard from './components/StockCard';
import Chart from './components/Chart';

interface StockData {
    symbol: string;
    price: number;
    time: string;
}

type Stocks = StockData[];

interface ChartDataPoint {
    time: string;
    price: number;
}

function App() {
    const [stocks, setStocks] = useState<Stocks>([]);
    const [status, setStatus] = useState('🟡 Waiting for live data...');
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['AAPL']);
    const [chartData, setChartData] = useState<Record<string, ChartDataPoint[]>>({});
    const ws = useRef<WebSocket | null>(null);
    const reconnectInterval = useRef<number | null>(null);

    useEffect(() => {
        const connectWebSocket = () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                return; // Already connected
            }
            
            // Use the WebSocket URL as-is from environment, with fallback for local development
            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws';
            ws.current = new WebSocket(wsUrl);

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

                    setChartData((prev) => {
                        const updatedData = { ...prev };
                        incoming.forEach((stock) => {
                            if (selectedSymbols.includes(stock.symbol)) {
                                const newEntry = {
                                    time: new Date(stock.time).toLocaleTimeString(),
                                    price: stock.price,
                                };
                                const existing = updatedData[stock.symbol] || [];
                                updatedData[stock.symbol] = [...existing.slice(-49), newEntry];
                            }
                        });
                        return updatedData;
                    });
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            };

            ws.current.onclose = () => {
                setStatus('🔴 Disconnected. Attempting to reconnect...');
                // Add a small delay before attempting to reconnect
                setTimeout(() => {
                    if (!reconnectInterval.current) {
                        reconnectInterval.current = setInterval(connectWebSocket, 5000);
                    }
                }, 1000);
            };

            ws.current.onerror = (error) => {
                console.warn('WebSocket encountered an error:', error);
                // Don't set status here, let onclose handle it
            };
        };

        connectWebSocket();

        return () => {
            if (ws.current) {
                const socket = ws.current;
                // Remove all listeners before closing
                socket.onclose = null;
                socket.onerror = null;
                socket.onmessage = null;
                socket.onopen = null;
                socket.close();
            }
            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current);
            }
        };
    }, [selectedSymbols]);

    useEffect(() => {
        if (selectedSymbols.length === 0 && stocks.length > 0) {
            setSelectedSymbols([stocks[0].symbol]);
        }
    }, [stocks, selectedSymbols]);

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Layout>
                        {/* Chart Section */}
                        <section className="chart-section">
                            <h2 className="chart-title">Live Stock Chart</h2>
                            <StatusBanner status={status} />
                            <Chart data={chartData} symbols={selectedSymbols} />
                            <Dropdown
                                options={stocks.map((s) => s.symbol)}
                                selected={selectedSymbols}
                                onSelect={(symbols) => {
                                    setSelectedSymbols(symbols);
                                    setChartData({});
                                }}
                            />
                        </section>

                        {/* Live Data Section */}
                        <h2 className="app-title">Live Financial Data</h2>

                        {stocks.length ? (
                            <div className="stock-grid">
                                {stocks.map((stock) => (
                                    <StockCard
                                        key={stock.symbol}
                                        symbol={stock.symbol}
                                        price={stock.price}
                                        time={stock.time}
                                        isActive={selectedSymbols.includes(stock.symbol)}
                                        onClick={(symbol: string) => {
                                            const alreadySelected = selectedSymbols.includes(symbol);
                                            setSelectedSymbols((prev) =>
                                                alreadySelected
                                                    ? prev.filter((s) => s !== symbol)
                                                    : [...prev, symbol]
                                            );
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="app-loading">Waiting for live data...</p>
                        )}
                    </Layout>
                }
            />
        </Routes>
    );
}

export default App;