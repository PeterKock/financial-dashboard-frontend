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

export default function Chart({ data, symbols }: Props) {
    const hasData = symbols.some((symbol) => data[symbol]?.length > 0);

    if (!hasData) {
        return (
            <div className="chart-placeholder">
                Waiting for chart data...
            </div>
        );
    }

    // Build normalized data array where each object has all prices keyed by symbol
    const timeMap: Record<string, any> = {};

    symbols.forEach((symbol) => {
        (data[symbol] || []).forEach((point) => {
            if (!timeMap[point.time]) {
                timeMap[point.time] = { time: point.time };
            }
            timeMap[point.time][symbol] = point.price;
        });
    });

    const normalizedData = Object.values(timeMap).sort((a, b) =>
        a.time.localeCompare(b.time)
    );

    return (
        <div className="chart-wrapper">
            <h3 className="chart-heading">
                Price History
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={normalizedData}>
                    <XAxis dataKey="time" tick={{ fill: '#ccc', fontSize: 12 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#ccc', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                        labelStyle={{ color: '#ccc' }}
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
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}