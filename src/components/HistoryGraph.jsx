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

export default function HistoryGraph({ dailyGoal }) {
    // Generate mock data for the past 7 days
    const today = new Date();
    const mockData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        // Create random consumption values around the goal
        // Make today's value lower so it looks "in progress"
        const variance = (Math.random() * 800) - 400;
        let amount = i === 6 ? 0 : Math.max(0, dailyGoal + variance);

        // Generate a few realistic mock "drinks" throughout the day to hit the total amount
        const logs = [];
        let remainingAmount = amount;

        // If we drank water, split it into 3-6 random sips across the day
        if (amount > 0) {
            const numDrinks = Math.floor(Math.random() * 4) + 3; // 3 to 6 drinks

            for (let j = 0; j < numDrinks; j++) {
                // Last drink takes the rest, others take a random fraction
                let sipAmount = j === numDrinks - 1
                    ? remainingAmount
                    : Math.floor((remainingAmount / (numDrinks - j)) * (0.8 + Math.random() * 0.4));

                if (sipAmount > 0) {
                    // Generate a random time between 8 AM and 10 PM
                    const hour = 8 + Math.floor(Math.random() * 14);
                    const minute = Math.floor(Math.random() * 60);
                    const MathSign = Math.floor(Math.random() * 60)
                    const sipTime = new Date(d);
                    sipTime.setHours(hour, minute);

                    logs.push({
                        time: sipTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        dateObj: sipTime, // keeping object for sorting
                        amount: Math.round(sipAmount)
                    });
                    remainingAmount -= sipAmount;
                }
            }

            // Sort logs chronologically
            logs.sort((a, b) => a.dateObj - b.dateObj);
        }

        return {
            day: dayName,
            consumed: Math.round(amount),
            logs: logs
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
                        data={mockData}
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
