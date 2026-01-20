import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  ReferenceLine 
} from 'recharts';

const TIME_RANGES = ['1M', '6M', '1Y', '3Y', '5Y', 'ALL'];

const ComparisonChart = ({ data }) => {
  const [range, setRange] = useState('1Y');

  const chartData = useMemo(() => {
    // 1. Safety Checks
    if (!Array.isArray(data) || !data.length) return [];

    // 2. Determine Cutoff Date based on selected Range
    const now = new Date();
    const cutoffDate = new Date(now.getTime());

    switch (range) {
      case '1M': cutoffDate.setMonth(now.getMonth() - 1); break;
      case '6M': cutoffDate.setMonth(now.getMonth() - 6); break;
      case '1Y': cutoffDate.setFullYear(now.getFullYear() - 1); break;
      case '3Y': cutoffDate.setFullYear(now.getFullYear() - 3); break;
      case '5Y': cutoffDate.setFullYear(now.getFullYear() - 5); break;
      case 'ALL': cutoffDate.setFullYear(1900); break;
      default: cutoffDate.setFullYear(now.getFullYear() - 1);
    }

    // 3. Collect ALL valid dates from ALL funds (Union of Dates)
    // This ensures we find the true "start" even if the primary fund is missing data on day 1.
    const uniqueDates = new Set();
    const fundDataMaps = {}; // Quick lookup: { 'Fund Name': Map(Date -> Value) }

    data.forEach(fund => {
      const map = new Map();
      fund.graph.forEach(point => {
        const pointDate = new Date(point.date);
        if (pointDate >= cutoffDate) {
          const dateStr = point.date.split('T')[0]; // Standardize date key (YYYY-MM-DD)
          uniqueDates.add(dateStr);
          map.set(dateStr, point.value);
        }
      });
      fundDataMaps[fund.MFName] = map;
    });

    // 4. Build the Sorted Timeline
    const sortedDates = Array.from(uniqueDates).sort();
    
    if (sortedDates.length === 0) return [];

    // 5. Construct Raw Data Rows
    const rawResult = sortedDates.map(dateStr => {
      const entry = { date: dateStr }; // You might need full ISO string depending on backend, but YYYY-MM-DD works for sorting
      data.forEach(fund => {
        const val = fundDataMaps[fund.MFName]?.get(dateStr);
        if (val !== undefined) {
          entry[fund.MFName] = val;
        }
      });
      return entry;
    });

    // 6. NORMALIZE TO PERCENTAGE (The "0% Start" Logic)
    
    // We need a "Base Price" for each fund. 
    // This is the price on the *first day* that specific fund has data within this range.
    const basePrices = {};

    data.forEach(fund => {
      const fundName = fund.MFName;
      // Find the first row where this fund has a value
      const firstValidEntry = rawResult.find(entry => entry[fundName] !== undefined && entry[fundName] !== null);
      if (firstValidEntry) {
        basePrices[fundName] = firstValidEntry[fundName];
      }
    });

    // Generate the final percentage data
    const percentageResult = rawResult.map(entry => {
      const newEntry = { date: entry.date };
      
      data.forEach(fund => {
        const fundName = fund.MFName;
        const currentPrice = entry[fundName];
        const basePrice = basePrices[fundName];

        if (currentPrice !== undefined && basePrice) {
          // FORMULA: Change = ((Current - Base) / Base) * 100
          // This guarantees the first point is always ((Base - Base)/Base)*100 = 0%
          const percentChange = ((currentPrice - basePrice) / basePrice) * 100;
          newEntry[fundName] = parseFloat(percentChange.toFixed(2)); 
        } else {
          newEntry[fundName] = null;
        }
      });

      return newEntry;
    });

    return percentageResult;

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
          <h2 className="text-xl font-bold text-slate-800">Performance Comparison</h2>
          <p className="text-slate-500 text-sm mt-1">Percentage return over selected period</p>
        </div>

        {/* Range Selector */}
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
            
            {/* Visual Guide: Line at 0% */}
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              // Ensure chart starts exactly at the first data point, leaving no gap
              domain={['dataMin', 'dataMax']} 
              tickFormatter={(val) => {
                const d = new Date(val);
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
              tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}%`}
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
              formatter={(value, name) => [`${value > 0 ? '+' : ''}${value}%`, name]}
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
                isAnimationActive={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart;