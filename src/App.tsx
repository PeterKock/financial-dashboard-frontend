import { useEffect, useRef, useState, useCallback } from 'react';
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
    const isComponentMounted = useRef(true);

    // Cleanup function to properly close WebSocket
    const cleanup = useCallback(() => {
        if (ws.current) {
            // Remove all listeners first
            ws.current.onclose = null;
            ws.current.onerror = null;
            ws.current.onmessage = null;
            ws.current.onopen = null;

            // Only close if not already closing/closed
            if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
                ws.current.close();
            }
            ws.current = null;
        }
        if (reconnectInterval.current) {
            clearInterval(reconnectInterval.current);
            reconnectInterval.current = null;
        }
    }, []);

    // Handle incoming message
    const handleMessage = useCallback((event: MessageEvent) => {
        if (!isComponentMounted.current) return;
        
        try {
            const incoming: Stocks = JSON.parse(event.data);
            latestData.current = incoming;
            setStocks(incoming);
        } catch (err) {
            console.error('Error processing message:', err);
            setStatus('🟡 Error processing data');
        }
    }, []);

    // Connect WebSocket
    const connect = useCallback(() => {
        if (!isComponentMounted.current) return;
        if (ws.current?.readyState === WebSocket.OPEN) return;

        cleanup();

        try {
            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws';
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                if (!isComponentMounted.current) return;
                setStatus('🟢 Connected');
                reconnectAttempts.current = 0;
            };

            ws.current.onmessage = handleMessage;

            ws.current.onclose = (event) => {
                if (!isComponentMounted.current) return;
                
                const wasClean = event.wasClean;
                const reason = event.reason || 'Unknown reason';
                console.log(`WebSocket closed ${wasClean ? 'cleanly' : 'unexpectedly'}:`, reason);

                if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(
                        INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current),
                        MAX_RECONNECT_DELAY
                    );
                    setStatus(`🔴 Disconnected. Reconnecting in ${delay/1000}s...`);
                    
                    setTimeout(() => {
                        if (isComponentMounted.current) {
                            reconnectAttempts.current++;
                            connect();
                        }
                    }, delay);
                } else {
                    setStatus('🔴 Connection failed. Please refresh the page.');
                }
            };

            ws.current.onerror = () => {
                if (!isComponentMounted.current) return;
                setStatus('🔴 Connection error');
            };
        } catch (error) {
            if (!isComponentMounted.current) return;
            console.error('Error creating WebSocket:', error);
            setStatus('🔴 Failed to create connection');
        }
    }, [cleanup, handleMessage]);

    // Initial connection
    useEffect(() => {
        isComponentMounted.current = true;
        
        const initialDelay = setTimeout(() => {
            if (isComponentMounted.current) {
                connect();
            }
        }, 1000);

        return () => {
            isComponentMounted.current = false;
            clearTimeout(initialDelay);
            cleanup();
        };
    }, [connect, cleanup]);

    // Handle chart data updates
    useEffect(() => {
        if (!isComponentMounted.current) return;
        
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
    }, [selectedSymbols, stocks]);

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