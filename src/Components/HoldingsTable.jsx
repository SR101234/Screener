import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const HoldingsTable = ( funds ) => {
  const getTopSector = (assets = []) => {
  if (!assets.length) return "-";

  const sectorMap = {};

  assets.forEach(({ sector, perc }) => {
    if (!sector) return;
    sectorMap[sector] = (sectorMap[sector] || 0) + Number(perc || 0);
  });

  let topSector = "-";
  let maxPerc = 0;

  for (const [sector, total] of Object.entries(sectorMap)) {
    if (total > maxPerc) {
      maxPerc = total;
      topSector = sector;
    }
  }

  return topSector;
};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {funds.funds.map((fund) => (
        
        <div
          key={fund.MFName}
          className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full shadow-sm"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-white/40">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span
                className={`w-2 h-8 rounded-full ${
                  fund.colorTheme === 'purple'
                    ? 'bg-fintech-purple'
                    : fund.colorTheme === 'teal'
                    ? 'bg-fintech-teal'
                    : 'bg-fintech-gold'
                }`}
              ></span>
              {fund.MFName}
            </h3>

            <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
              <span>
                Top Sector:{' '}
                <strong className="text-slate-700">
                  {getTopSector(fund.asset)}
                </strong>
              </span>
              <span>
                Assets:{' '}
                <strong className="text-slate-700">
                  {fund.asset.length}
                </strong>
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto max-h-[350px] hide-scrollbar relative">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 bg-slate-50/50 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  <th className="px-5 py-3 font-medium">Asset</th>
                  <th className="px-5 py-3 font-medium">Sector</th>
                  <th className="px-5 py-3 font-medium text-right">%</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {fund.asset.map((h, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {h.name}
                    </td>

                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {h.sector}
                    </td>

                    <td className="px-5 py-3 text-right font-semibold text-slate-700">
                      {h.perc}%
                      <div className="w-full bg-slate-100 h-1 mt-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            fund.colorTheme === 'purple'
                              ? 'bg-fintech-purple'
                              : fund.colorTheme === 'teal'
                              ? 'bg-fintech-teal'
                              : 'bg-fintech-gold'
                          }`}
                          style={{ width: `${h.perc * 5}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

       
        </div>
      ))}
    </div>
  );
};

export default HoldingsTable;
