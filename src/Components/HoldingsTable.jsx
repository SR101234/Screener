import React from 'react';

const HoldingsTable = (funds) => {
  const getTopSector = (assets = []) => {
    if (!assets.length) return "-";

    const sectorMap = {};

    assets.forEach(({ sector, perc }) => {
      if (!sector) return;
      const validPerc = Math.max(0, Number(perc || 0)); 
      sectorMap[sector] = (sectorMap[sector] || 0) + validPerc;
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
            <h3 className="font-bold text-slate-800 flex items-start gap-2 min-h-[3.5rem]">
              <span
                className={`w-2 h-8 rounded-full flex-shrink-0 mt-0.5 ${
                  fund.colorTheme === 'purple'
                    ? 'bg-fintech-purple'
                    : fund.colorTheme === 'teal'
                    ? 'bg-fintech-teal'
                    : 'bg-fintech-gold'
                }`}
              ></span>
              <span className="line-clamp-2 leading-tight py-1">
                {fund.MFName}
              </span>
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
                  {fund.asset.filter(a => Number(a.perc) >= 0).length}
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
                {[...fund.asset]
                  .filter(h => Number(h.perc) >= 0) 
                  .sort((a, b) => Number(b.perc) - Number(a.perc))
                  .map((h, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 transition-colors cursor-default"
                      // UPDATED: Added title here so hovering anywhere on the row shows the full name
                      title={h.name} 
                    >
                      <td className="px-5 py-3 font-medium text-slate-700">
                        {/* Name truncated to 10 chars + '...' */}
                        {h.name && h.name.length > 10 
                          ? `${h.name.substring(0, 10)}...` 
                          : h.name}
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