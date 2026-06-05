import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";
import { InfoTooltip } from '../../shared/ui/InfoTooltip';

export const TrendsWidget = ({ faGrades }: { faGrades: number[] }) => {
  const chartData = faGrades.map((g, i) => ({ name: `FA ${i + 1}`, value: g }));

  return (
    <div className="card" style={{ padding: '20px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0' }}>
      <div>
        <div style={{display: 'flex', gap: '10px'}}>
        <TrendingUp size={20} color="#3b82f6" />
        <div style={{display: 'flex'}}>
          <h3 style={{ margin: 0 }}>FA Grade Trend</h3>
          <InfoTooltip content="This graph clearly illustrates the trends in your current ratings." />
        </div>
        </div>
        <p style={{ margin: '0 0 10px 30px', fontSize: '0.8rem', color: '#64748b' }}>Current grades</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={{ r: 5 }} 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};