import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import './HistoryGraph.css';

export default function HistoryGraph({ dailyGoal, historyData }) {
    // Process real history data for the past 7 days
    const today = new Date();
    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateString = d.toLocaleDateString('en-US');

        // Filter historyData for this specific date
        const dayLogs = (historyData || []).filter(log => {
            const logDate = new Date(log.timestamp).toLocaleDateString('en-US');
            return logDate === dateString;
        });

        // Calculate total consumed
        const totalConsumed = dayLogs.reduce((sum, log) => sum + log.amount, 0);

        // Format logs for tooltip
        const formattedLogs = dayLogs.map(log => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
                time: timeStr,
                amount: log.amount
            };
        });

        return {
            day: dayName,
            consumed: totalConsumed,
            logs: formattedLogs
        };
    });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isGoalMet = data.consumed >= dailyGoal;
            return (
                <div className="custom-tooltip glass-panel">
                    <p className="label">{`${label}`}</p>
                    <div className="tooltip-header">
                        <span className="dot"></span>
                        Total: <strong>{data.consumed}ml</strong>
                    </div>

                    {data.logs && data.logs.length > 0 && (
                        <div className="drink-logs-list">
                            <p className="logs-title">Drink History</p>
                            <ul>
                                {data.logs.map((log, index) => (
                                    <li key={index}>
                                        <span className="log-time">{log.time}</span>
                                        <span className="log-amount">+{log.amount}ml</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <p className={`goal-status ${isGoalMet ? 'met' : 'missed'}`}>
                        {isGoalMet ? '✅ Goal Met' : '❌ Missed Target'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="history-graph-container glass-panel fade-in">
            <div className="graph-header">
                <h3 className="section-title">Weekly Hydration History</h3>
                <p className="graph-subtitle">Your target: {dailyGoal}ml per day</p>
            </div>

            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <ReferenceLine
                            y={dailyGoal}
                            stroke="var(--secondary)"
                            strokeDasharray="3 3"
                            label={{ position: 'top', value: 'Goal', fill: 'var(--secondary)', fontSize: 12 }}
                        />
                        <Bar
                            dataKey="consumed"
                            fill="url(#colorUv)"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                        />
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
