import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

// 1. Define ranges internally to ensure they match the switch case logic
const TIME_RANGES = ['1M', '6M', '1Y', '3Y', '5Y', 'ALL'];

const ComparisonChart = ({ data }) => {
  const [range, setRange] = useState('1Y');

  const chartData = useMemo(() => {
    // Safety check: ensure data is an array
    if (!Array.isArray(data) || !data.length) return [];

    const primaryFund = data[0];
    if (!primaryFund?.graph) return [];

    // 2. Calculate the "Cutoff Date"
    const now = new Date();
    // Clone 'now' so we don't modify the original date object
    const cutoffDate = new Date(now.getTime()); 

    switch (range) {
      case '1M': cutoffDate.setMonth(now.getMonth() - 1); break;
      case '6M': cutoffDate.setMonth(now.getMonth() - 6); break;
      case '1Y': cutoffDate.setFullYear(now.getFullYear() - 1); break;
      case '3Y': cutoffDate.setFullYear(now.getFullYear() - 3); break;
      case '5Y': cutoffDate.setFullYear(now.getFullYear() - 5); break;
      case 'ALL': cutoffDate.setFullYear(1900); break; // Go back to the beginning
      default: cutoffDate.setFullYear(now.getFullYear() - 1); // Default fall-back
    }

    // 3. Create Fast Lookup Maps for secondary funds (Performance Fix)
    const fundLookups = data.slice(1).map(fund => {
      const valueMap = new Map();
      fund.graph.forEach(point => {
        const dateKey = point.date.split('T')[0]; // Key: "YYYY-MM-DD"
        valueMap.set(dateKey, point.value);
      });
      return { name: fund.MFName, map: valueMap };
    });

    // 4. Build the result array
    const result = [];
    
    // Iterate through primary fund history
    for (const point of primaryFund.graph) {
      const pointDate = new Date(point.date);
      
      // Filter: Only add points NEWER than the cutoff date
      if (pointDate >= cutoffDate) {
        const dateKey = point.date.split('T')[0];
        
        const entry = {
          date: point.date, // keep original ISO string for sorting/display
          [primaryFund.MFName]: point.value
        };

        // Add values from other funds if they exist on this date
        fundLookups.forEach(lookup => {
          if (lookup.map.has(dateKey)) {
            entry[lookup.name] = lookup.map.get(dateKey);
          }
        });

        result.push(entry);
      }
    }

    // 5. Sort by Date Ascending (Important for LineChart continuity)
    return result.sort((a, b) => new Date(a.date) - new Date(b.date));

  }, [data, range]);

  const getColor = (theme) => {
    switch (theme) {
      case 'purple': return '#6e27ff';
      case 'teal': return '#00c4cc';
      case 'gold': return '#ffb700';
      default: return '#666';
    }
  };

  if (!data || !data.length) return <div className="p-4 text-slate-500">No data available</div>;

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">NAV Performance</h2>
          <p className="text-slate-500 text-sm mt-1">Growth of investment over time</p>
        </div>

        {/* Range Selector Buttons */}
        <div className="flex flex-wrap justify-center gap-1 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                range === r
                  ? 'bg-white text-fintech-teal shadow-md text-teal-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => {
                const d = new Date(val);
                // Smart formatting based on range
                if (range === '1M' || range === '5D') return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                return `${d.toLocaleString('default', { month: 'short' })} '${d.getFullYear().toString().slice(2)}`;
              }}
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={40}
            />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '12px' }}
              labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              itemStyle={{ fontSize: '14px', fontWeight: 600, padding: 0 }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {data.map((fund) => (
              <Line
                key={fund.MFName}
                type="monotone"
                dataKey={fund.MFName}
                name={fund.MFName}
                stroke={getColor(fund.colorTheme)}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                isAnimationActive={false} // Improves performance when switching ranges
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart;