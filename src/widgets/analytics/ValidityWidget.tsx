import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Target } from "lucide-react";

export const ValidityWidget = ({ faGrades, rk1, rk2 }: { faGrades: number[], rk1: number, rk2: number }) => {
  const chartData = [
    ...faGrades.map((g, i) => ({ name: `ФО ${i + 1}`, value: g })),
    { name: 'РК 1', value: rk1 },
    { name: 'РК 2', value: rk2 }
  ];

  return (
    <div className="card" style={{ padding: '20px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Target size={20} color="#3b82f6" />
        <h3 style={{ margin: 0 }}>Валидность текущих оценок</h3>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            stroke="var(--chart-text)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          {/* Добавляем Tooltip для эффекта при наведении */}
          <Tooltip 
            cursor={{ fill: '#f8fafc' }} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.name.includes('РК') ? '#10b981' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};