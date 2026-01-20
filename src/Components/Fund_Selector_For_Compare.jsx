import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Plus, X, CheckCircle } from "lucide-react";
import FundComparison from "./Fund_Comparison";

// 1. Memoized Card Component to prevent unnecessary re-renders of the list items
const FundCard = React.memo(({ fund, active, disabled, onToggle }) => {
  return (
    <div
      onClick={() => !disabled && onToggle(fund)}
      className={`
        group relative p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between
        ${
          active
            ? "border-indigo-500 bg-indigo-50/50 shadow-md ring-1 ring-indigo-500"
            : disabled
            ? "opacity-50 cursor-not-allowed border-slate-100 bg-slate-50"
            : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md"
        }
      `}
    >
      <div className="flex-1 min-w-0 pr-4">
        <h3 className={`font-semibold text-base mb-1 truncate ${active ? "text-indigo-900" : "text-slate-800"}`}>
          {fund.name}
        </h3>
        <span className={`inline-block text-xs px-2 py-1 rounded-md ${active ? "bg-indigo-200 text-indigo-800" : "bg-slate-100 text-slate-500"}`}>
          {fund.id}
        </span>
      </div>

      <div className="flex-shrink-0">
        {active ? (
          <CheckCircle className="w-6 h-6 text-indigo-600 fill-indigo-100" />
        ) : (
          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center border-slate-300 group-hover:border-indigo-400">
            <Plus className="w-3 h-3 text-indigo-500 opacity-0 group-hover:opacity-100" />
          </div>
        )}
      </div>
    </div>
  );
});

const SelectionScreen = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState(""); // State for debouncing
  const [fundList, setFundList] = useState([]);
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [proceedClicked, setProceedClicked] = useState(false);

  // 2. Debounce Logic: Updates debouncedTerm only after user stops typing for 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  // 3. Filter Funds based on DEBOUNCED term + Slice to limit DOM nodes
  const filteredFunds = useMemo(() => {
    if (!debouncedTerm.trim()) return [];
    const term = debouncedTerm.toLowerCase();
    return fundList
      .filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          f.id.toLowerCase().includes(term)
      )
      .slice(0, 20); // Only render top 20 matches for performance
  }, [debouncedTerm, fundList]);

  const onToggleFund = useCallback((fund) => {
    setSelectedFunds((prev) => {
      const exists = prev.find((f) => f.id === fund.id);
      if (exists) return prev.filter((f) => f.id !== fund.id);
      if (prev.length >= 3) return prev;
      return [...prev, fund];
    });
  }, []);

  const isSelected = (fundId) => selectedFunds.some((f) => f.id === fundId);
  const canProceed = selectedFunds.length >= 2 && selectedFunds.length <= 3;

  if (proceedClicked) {
    return <FundComparison params={selectedFunds} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
          Compare Mutual Funds
        </h1>
        <p className="text-slate-200 text-lg max-w-2xl mx-auto">
          Search and add 2 or 3 schemes to generate an AI-powered comparison report.
        </p>
      </div>

      {/* Search Box - Directly updates searchTerm for instant feedback in input field */}
      <div className="relative mb-8 max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg placeholder:text-slate-400"
          style={{color:"black"}}
          placeholder="Type fund name or ISIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Selected Funds Chips */}
      <div className="mb-8 min-h-[60px]">
        {selectedFunds.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            {selectedFunds.map((fund) => (
              <div
                key={fund.id}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-100 shadow-sm"
              >
                <span className="font-medium text-sm truncate max-w-[200px]">
                  {fund.name}
                </span>
                <button
                  onClick={() => onToggleFund(fund)}
                  className="hover:bg-indigo-200 rounded-full p-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="min-h-[300px] mb-24">
        {!searchTerm.trim() ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium opacity-60">Start typing to search for funds</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFunds.map((fund) => (
              <FundCard
                key={fund.id}
                fund={fund}
                active={isSelected(fund.id)}
                disabled={!isSelected(fund.id) && selectedFunds.length >= 3}
                onToggle={onToggleFund}
              />
            ))}
            {filteredFunds.length === 0 && debouncedTerm === searchTerm && (
               <div className="col-span-full text-center py-10 text-slate-400">
                 No funds found matching "{searchTerm}"
               </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-between items-center z-50 md:max-w-4xl md:mx-auto md:bottom-8 md:rounded-2xl md:shadow-2xl md:border">
        <div className="text-slate-600 font-medium">{selectedFunds.length} / 3 Selected</div>
        <button
          onClick={() => setProceedClicked(true)}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform ${
            canProceed
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 hover:shadow-xl"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          Compare Now
        </button>
      </div>
    </div>
  );
};

export default SelectionScreen;