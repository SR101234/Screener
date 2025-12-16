import React, { useEffect, useState, useMemo } from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { CircularProgress } from '@mui/material';
import { Search, Plus, X, CheckCircle, Filter } from 'lucide-react'; 

// --- Import your existing sub-components ---
import FundCard from './FundCard';
import ComparisonChart from './ComparisonChart';
import HoldingsTable from './HoldingsTable';
import Tablenav from './Tablenav';
import Heatmap from './Heatmap';

// ============================================================================
// INTERNAL COMPONENT: SELECTION MODAL
// ============================================================================
const SelectionModal = ({ onClose, onProceed, initialSelectedFunds }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fundList, setFundList] = useState([]);
  const [selectedFunds, setSelectedFunds] = useState(initialSelectedFunds || []);

  // Fetch Fund List
  useEffect(() => {
    const getFundList = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_BACKEND + `/mf_compare_list`);
        const data = await response.json();
        setFundList(data);
      } catch (err) {
        console.error("Error fetching fund list:", err);
      }
    };
    getFundList();
  }, []);

  // Filter Logic
  const filteredFunds = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return fundList.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.id.toLowerCase().includes(term)
    );
  }, [searchTerm, fundList]);

  // Toggle Logic
  const onToggleFund = (fund) => {
    setSelectedFunds(prev => {
      const exists = prev.find(f => f.id === fund.id);
      if (exists) return prev.filter(f => f.id !== fund.id);
      if (prev.length >= 3) return prev;
      return [...prev, fund]; 
    });
  };

  const isSelected = (fundId) => selectedFunds.some((f) => f.id === fundId);
  const canProceed = selectedFunds.length >= 2 && selectedFunds.length <= 3;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 bg-opacity-70 flex items-start justify-center overflow-y-auto p-4 md:p-8">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative transform transition-all">
        
        {/* Header */}
        <div className="sticky top-0 p-6 bg-white border-b border-slate-200 rounded-t-xl z-10 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Filter className="w-6 h-6 text-indigo-500" />
                Select Funds
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Content */}
        <div className="px-4 py-6 md:px-8 max-h-[60vh] overflow-y-auto">
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Search by name or ISIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="mb-6 flex flex-wrap gap-2 min-h-[40px]">
                {selectedFunds.map((fund) => (
                    <div key={fund.id} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm">
                        <span className="text-sm font-medium truncate max-w-[150px]">{fund.name}</span>
                        <button onClick={() => onToggleFund(fund)} className="hover:bg-indigo-200 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="min-h-[200px]">
                {!searchTerm.trim() ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <Search className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm font-medium opacity-60">Type to search funds</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredFunds.map((fund) => {
                            const active = isSelected(fund.id);
                            const disabled = !active && selectedFunds.length >= 3;
                            return (
                                <div key={fund.id} onClick={() => !disabled && onToggleFund(fund)}
                                    className={`relative p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                                        active ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500" : 
                                        disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "border-slate-200 hover:border-indigo-300 hover:shadow-md"
                                    }`}
                                >
                                    <div className="flex-1 min-w-0 pr-3">
                                        <h3 className={`font-semibold text-sm mb-1 truncate ${active ? "text-indigo-900" : "text-slate-800"}`}>{fund.name}</h3>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{fund.id}</span>
                                    </div>
                                    {active ? <CheckCircle className="w-5 h-5 text-indigo-600 fill-indigo-100" /> : <Plus className="w-4 h-4 text-slate-400" />}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-between items-center">
            <span className="text-slate-600 font-medium text-sm">{selectedFunds.length} / 3 Selected</span>
            <button onClick={() => canProceed && onProceed(selectedFunds)} disabled={!canProceed}
                className={`px-6 py-2.5 rounded-lg font-bold text-white shadow-md transition-all ${
                    canProceed ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-300 cursor-not-allowed"
                }`}
            >
                Compare Funds
            </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT: FUND COMPARISON
// ============================================================================
function FundComparison({ params: initialParams }) {
  const [comparisonParams, setComparisonParams] = useState(initialParams || []);
  const [data, setData] = useState([]);
  const [showSelectionScreen, setShowSelectionScreen] = useState(false);
  
  // 1. ADD LOADING STATE
  const [isLoading, setIsLoading] = useState(false); 

  const themes = ["purple", "teal", "gold"];

  useEffect(() => {
    const fetchFunds = async () => {
      if (!comparisonParams || comparisonParams.length === 0) {
        setData([]);
        setIsLoading(false);
        return;
      }

      // 2. SET LOADING TRUE BEFORE FETCH
      setIsLoading(true); 

      try {
        const responses = await Promise.all(
          comparisonParams.map(p =>
            fetch(import.meta.env.VITE_BACKEND + `/api/MFinfo`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: p.id }),
            }).then(res => res.json())
          )
        );
        const themedData = responses.map((fund, index) => ({
          ...fund,
          colorTheme: themes[index % themes.length],
          graph: fund.graph.map(point => ({ value: point.nav, date: point.markDate }))
        }));
        
        setData(themedData);
      } catch (err) {
        console.error("Error fetching funds:", err);
      } finally {
        // 3. SET LOADING FALSE AFTER FETCH (Success or Fail)
        setIsLoading(false); 
      }
    };
    fetchFunds();
  }, [comparisonParams]);

  const handleUpdateFunds = (newParams) => {
    setComparisonParams(newParams);
    setShowSelectionScreen(false);
    // Note: useEffect will trigger immediately after this because comparisonParams changed
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans selection:bg-fintech-teal/20">
      <Tablenav />
      
      {/* RENDER MODAL IF OPEN */}
      {showSelectionScreen && (
        <SelectionModal 
            onClose={() => setShowSelectionScreen(false)} 
            onProceed={handleUpdateFunds}
            initialSelectedFunds={comparisonParams}
        />
      )}

      {/* 4. CONDITIONAL RENDERING: CHECK LOADING FIRST */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <VStack colorPalette="teal">
            <CircularProgress size={40} />
            <Text color="rgba(66, 153, 225, 1)">Fetching Analytics...</Text>
          </VStack>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
          
          {/* Page Title & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Fund Comparison</h1>
              <p className="text-slate-800 mt-2 text-lg">Detailed analysis of NAV, CAGR, holdings & risk metrics.</p>
            </div>
            
            <div className="flex items-center gap-4">
                 <button
                    onClick={() => setShowSelectionScreen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors shadow-sm"
                 >
                    <Filter className="w-4 h-4" />
                    Change Funds
                 </button>
                 <div className="text-right hidden md:block">
                    <p className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Last Updated</p>
                    <p className="text-sm font-medium text-slate-700">{new Date().toLocaleDateString()}</p>
                 </div>
            </div>
          </div>

          {/* Empty State */}
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 border border-slate-200 rounded-lg mt-8">
                <h3 className="text-xl font-medium text-slate-500 mb-4">No Funds Selected</h3>
                <button onClick={() => setShowSelectionScreen(true)} className="px-6 py-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg">
                    Select Funds
                </button>
            </div>
          )}

          {/* Data Content */}
          {data.length > 0 && (
            <>
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((fund) => <FundCard key={fund.MFName} fund={fund} />)}
                </section>

                <section>
                    <ComparisonChart data={data} />
                </section>

                <section className="w-full">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Monthly Performance Heatmaps</h2>
                    <div className="flex flex-col space-y-8"> 
                    {data.map((fund) => (
                        <div key={fund.MFName} className="w-full">
                        <div className="border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 text-center border-b pb-4">{fund.MFName}</h2>
                            <Heatmap heatmapData={fund.heatmap} />
                        </div>
                        </div>
                    ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Top Holdings</h2>
                    </div>
                    <HoldingsTable funds={data} />
                </section>
            </>
          )}
        </main>
      )}
    </div>
  );
}

export default FundComparison;