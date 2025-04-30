import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface StockDataPoint {
    time: string;
    price: number;
}

interface Props {
    data: Record<string, StockDataPoint[]>;
    symbols: string[];
}

const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const formatTime = (time: string): string => {
    try {
        const date = new Date(time);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', time);
            return 'Invalid Time';
        }
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Invalid Time';
    }
};

export default function Chart({ data, symbols }: Props) {
    const hasData = symbols.some((symbol) => data[symbol]?.length > 0);

    if (!hasData) {
        return (
            <div className="chart-placeholder">
                Waiting for chart data...
            </div>
        );
    }

    // Get all unique timestamps across all symbols
    const allTimestamps = new Set<string>();
    symbols.forEach(symbol => {
        (data[symbol] || []).forEach(point => {
            allTimestamps.add(point.time);
        });
    });

    // Convert to array and sort
    const sortedTimestamps = Array.from(allTimestamps).sort();

    // Create normalized data points for each timestamp
    const normalizedData = sortedTimestamps.map(timestamp => {
        const dataPoint: Record<string, any> = { time: timestamp };
        symbols.forEach(symbol => {
            const point = (data[symbol] || []).find(p => p.time === timestamp);
            if (point) {
                dataPoint[symbol] = point.price;
            }
        });
        return dataPoint;
    });

    return (
        <div className="chart-wrapper">
            <h3 className="chart-heading">
                Price History
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={normalizedData}>
                    <XAxis 
                        dataKey="time" 
                        tick={{ fill: '#ccc', fontSize: 12 }} 
                        tickFormatter={formatTime}
                    />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#ccc', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                        labelStyle={{ color: '#ccc' }}
                        labelFormatter={formatTime}
                    />
                    <Legend />
                    {symbols.map((symbol, index) => (
                        <Line
                            key={symbol}
                            type="monotone"
                            dataKey={symbol}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={true}
                            connectNulls={true}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}