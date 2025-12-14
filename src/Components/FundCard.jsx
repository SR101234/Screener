import React from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

const FundCard = ({ fund }) => {// Log last 30 data points for brevity
  const isPositive = fund.changePercentage >= 0;
  const safeId = fund.MFName.replace(/\s+/g, "-");

  const themeColors = {
    purple: { stroke: '#6e27ff', fill: '#6e27ff' },
    teal: { stroke: '#00c4cc', fill: '#00c4cc' },
    gold: { stroke: '#ffb700', fill: '#ffb700' },
  };

  const color = themeColors[fund.colorTheme];

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4 relative overflow-hidden group">

      {/* Top Border Accent */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${fund.colorTheme === 'purple'
            ? 'bg-fintech-purple'
            : fund.colorTheme === 'teal'
              ? 'bg-fintech-teal'
              : 'bg-fintech-gold'

          }`}
      />

      <div className="flex justify-between items-start">
        <div>
          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            {fund.category}
          </span>
          <h3 className="text-xl font-bold text-slate-800 leading-tight pr-2">
            {fund.MFName}
          </h3>
        </div>
      </div>

      <div className="flex items-end gap-3 mt-2">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            NAV
          </p>
          <p className="text-3xl font-bold text-slate-900">
            ₹{fund.nav.toFixed(2)}
          </p>
        </div>

        <div
          className={`flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded-md text-sm font-bold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(fund.change)}%
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className="h-24 w-full">
        <ResponsiveContainer>
          <AreaChart data={fund.graph.slice(-30)}>
         
          
            <defs>
              <linearGradient id={`gradient-${safeId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color.fill} stopOpacity={0} />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="value"
              stroke={color.stroke}
              fill="transparent"
              strokeWidth={1.5}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-2 pt-4 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            CAGR (1Y)
          </span>
          <span
            className={`text-sm font-semibold ${parseFloat(fund.cagr) >= 15 ? 'text-green-600' : 'text-slate-700'
              }`}
          >
            {fund.cagr}%
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            Expense Ratio <Info size={10} />
          </span>
          <span className="text-sm font-semibold text-slate-700">
            {fund.ter}%
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            Inception
          </span>
          <span className="text-sm font-semibold text-slate-700">
            {new Date(fund.inception).getFullYear()}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            Fund Manager
          </span>
          <span
            className="text-sm font-semibold text-slate-700 truncate"
            title={fund.fund_manager}
          >
            {fund.fund_manager}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FundCard;
