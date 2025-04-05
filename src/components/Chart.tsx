import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StockDataPoint {
    time: string;
    price: number;
}

interface Props {
    data: StockDataPoint[];
    symbol: string;
}

export default function Chart({ data, symbol }: Props) {
    return (
        <div className="chart-wrapper">
            <h3 className="chart-heading">{symbol} Price History</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <XAxis dataKey="time" tick={{ fill: '#ccc', fontSize: 12 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#ccc', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                        labelStyle={{ color: '#ccc' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}