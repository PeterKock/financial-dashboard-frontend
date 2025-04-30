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
    const reconnectAttempts = useRef<number>(0);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const INITIAL_RECONNECT_DELAY = 1000;
    const MAX_RECONNECT_DELAY = 30000;
    const latestData = useRef<Stocks>([]);

    // WebSocket connection effect
    useEffect(() => {
        const getReconnectDelay = () => {
            const delay = Math.min(
                INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current),
                MAX_RECONNECT_DELAY
            );
            return delay;
        };

        const cleanupWebSocket = () => {
            if (ws.current) {
                const socket = ws.current;
                socket.onclose = null;
                socket.onerror = null;
                socket.onmessage = null;
                socket.onopen = null;
                socket.close();
                ws.current = null;
            }
            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current);
                reconnectInterval.current = null;
            }
        };

        const handleIncomingMessage = (event: MessageEvent) => {
            try {
                const incoming: Stocks = JSON.parse(event.data);
                latestData.current = incoming;
                setStocks(incoming);
            } catch (err) {
                console.error('Error processing message:', err);
                setStatus('🟡 Error processing data');
            }
        };

        const connectWebSocket = () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                return;
            }

            cleanupWebSocket();

            try {
                const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws';
                ws.current = new WebSocket(wsUrl);

                ws.current.onopen = () => {
                    setStatus('🟢 Connected');
                    reconnectAttempts.current = 0;
                    if (reconnectInterval.current) {
                        clearInterval(reconnectInterval.current);
                        reconnectInterval.current = null;
                    }
                };

                ws.current.onmessage = handleIncomingMessage;

                ws.current.onclose = (event) => {
                    const wasClean = event.wasClean;
                    const reason = event.reason || 'Unknown reason';
                    
                    console.log(`WebSocket closed ${wasClean ? 'cleanly' : 'unexpectedly'}:`, reason);
                    
                    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                        const delay = getReconnectDelay();
                        setStatus(`🔴 Disconnected. Reconnecting in ${delay/1000}s...`);
                        
                        setTimeout(() => {
                            reconnectAttempts.current++;
                            connectWebSocket();
                        }, delay);
                    } else {
                        setStatus('🔴 Connection failed. Please refresh the page.');
                    }
                };

                ws.current.onerror = (error) => {
                    console.warn('WebSocket encountered an error:', error);
                    setStatus('🔴 Connection error');
                };
            } catch (error) {
                console.error('Error creating WebSocket:', error);
                setStatus('🔴 Failed to create connection');
            }
        };

        const initialDelay = setTimeout(() => {
            connectWebSocket();
        }, 1000);

        return () => {
            clearTimeout(initialDelay);
            cleanupWebSocket();
        };
    }, []); // WebSocket connection effect runs only once

    // Separate effect for handling chart data updates based on selectedSymbols
    useEffect(() => {
        if (latestData.current.length > 0) {
            setChartData((prev) => {
                const updatedData = { ...prev };
                latestData.current.forEach((stock) => {
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
        }
    }, [selectedSymbols, stocks]); // Update chart when symbols change or new data arrives

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