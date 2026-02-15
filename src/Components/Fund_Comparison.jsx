import React, { useEffect, useState, useMemo } from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { CircularProgress } from '@mui/material';
import { Search, Plus, X, CheckCircle, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'; 
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

// --- Import your existing sub-components ---
import FundCard from './FundCard';
import ComparisonChart from './ComparisonChart';
import HoldingsTable from './HoldingsTable';
import Tablenav from './Tablenav';
import Heatmap from './Heatmap';
import Footer from './Footer';

// --- Constants ---
const ALL_MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

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
  const [isLoading, setIsLoading] = useState(false); 
  
  // State for Heatmap Slideshow
  const [activeHeatmapIndex, setActiveHeatmapIndex] = useState(0);

  // --- Date Selection Logic ---
  const latestReadyDate = useMemo(() => {
    const today = new Date();
    const day = today.getDate();
    const latest = new Date();
    if (day < 15) {
      latest.setMonth(today.getMonth() - 1);
    }
    return latest;
  }, []);

  const currentYearValue = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(latestReadyDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(latestReadyDate.getFullYear());

  const years = Array.from({ length: 2 }, (_, i) => currentYearValue - i);
  
  const availableMonths = useMemo(() => {
    if (selectedYear < currentYearValue) return ALL_MONTHS;
    return ALL_MONTHS.slice(0, latestReadyDate.getMonth() + 1);
  }, [selectedYear, latestReadyDate, currentYearValue]);

  const themes = ["purple", "teal", "gold"];

  useEffect(() => {
    setActiveHeatmapIndex(0);
  }, [comparisonParams]);

  useEffect(() => {
    const fetchFunds = async () => {
      if (!comparisonParams || comparisonParams.length === 0) {
        setData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true); 

      try {
        const responses = await Promise.all(
          comparisonParams.map(p =>
            fetch(import.meta.env.VITE_BACKEND + `/api/MFinfo`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                code: p.id,
                month: selectedMonth + 1,
                year: selectedYear 
              }),
            }).then(res => res.json())
          )
        );
        
        const themedData = responses.map((fund, index) => ({
          ...fund,
          colorTheme: themes[index % themes.length],
          graph: fund.graph ? fund.graph.map(point => ({ value: point.nav, date: point.markDate })) : []
        }));

        setData(themedData);
       
      } catch (err) {
        console.error("Error fetching funds:", err);
      } finally {
        setIsLoading(false); 
      }
    };
    fetchFunds();
  }, [comparisonParams, selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedYear === currentYearValue && selectedMonth > latestReadyDate.getMonth()) {
      setSelectedMonth(latestReadyDate.getMonth());
    }
  }, [selectedYear, selectedMonth, latestReadyDate, currentYearValue]);

  const handleUpdateFunds = (newParams) => {
    setComparisonParams(newParams);
    setShowSelectionScreen(false);
  };

  const handleNextHeatmap = () => {
    setActiveHeatmapIndex((prev) => (prev + 1) % data.length);
  };

  const handlePrevHeatmap = () => {
    setActiveHeatmapIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans selection:bg-indigo-50">
      <Tablenav />
      
      {showSelectionScreen && (
        <SelectionModal 
            onClose={() => setShowSelectionScreen(false)} 
            onProceed={handleUpdateFunds}
            initialSelectedFunds={comparisonParams}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <VStack>
            <CircularProgress size={40} />
            <Text color="#4f46e5" fontWeight="semibold">Calculating Alpha...</Text>
          </VStack>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Fund Comparison</h1>
              <p className="text-slate-500 mt-2 text-lg">Compare performance metrics and portfolio composition.</p>
            </div>
            
            <div className="flex items-center gap-4">
                 <button
                    onClick={() => setShowSelectionScreen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
                 >
                    <Filter className="w-4 h-4" />
                    Change Selection
                 </button>
            </div>
          </div>

          

          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                <h3 className="text-xl font-medium text-slate-500 mb-4">No Funds Selected</h3>
                <button onClick={() => setShowSelectionScreen(true)} className="px-6 py-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg transition-all">
                    Select Funds to Compare
                </button>
            </div>
          )}

          {data.length > 0 && (
            <>
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((fund) => <FundCard key={fund.MFName} fund={fund} />)}
                </section>

                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <ComparisonChart data={data} />
                </section>

                {/* THEMED TIME PERIOD SELECTORS */}
          <div className="inline-flex flex-col md:flex-row items-start md:items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-fit">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-100 hidden md:flex">
               <Calendar className="w-5 h-5 text-indigo-500" />
               <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Period</span>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <FormControl variant="outlined" size="small" sx={{ 
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#6366f1' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '1px' },
                },
                '& .MuiInputLabel-root': { color: '#64748b', fontSize: '0.875rem', fontWeight: 600 },
                '& .MuiSelect-select': { fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }
              }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  label="Year"
                  onChange={(e) => setSelectedYear(e.target.value)}
                  MenuProps={{ PaperProps: { sx: { borderRadius: '12px', mt: 1, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } } }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="outlined" size="small" sx={{ 
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#6366f1' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '1px' },
                },
                '& .MuiInputLabel-root': { color: '#64748b', fontSize: '0.875rem', fontWeight: 600 },
                '& .MuiSelect-select': { fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }
              }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Month"
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  MenuProps={{ PaperProps: { sx: { borderRadius: '12px', mt: 1, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } } }}
                >
                  {availableMonths.map((month) => (
                    <MenuItem key={month} value={ALL_MONTHS.indexOf(month)}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

                <section className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Monthly Performance Heatmaps</h2>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {activeHeatmapIndex + 1} / {data.length}
                        </span>
                    </div>

                    <div className="relative w-full">
                        <div className="border border-slate-200 rounded-2xl p-6 shadow-sm bg-white min-h-[400px]">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 gap-4">
                                <button 
                                    onClick={handlePrevHeatmap}
                                    className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>

                                <h2 className="text-xl font-bold text-slate-800 text-center flex-grow truncate px-2">
                                    {data[activeHeatmapIndex]?.MFName}
                                </h2>

                                <button 
                                    onClick={handleNextHeatmap}
                                    className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="transition-all duration-300" key={`${activeHeatmapIndex}-${selectedMonth}`}>
                                {data[activeHeatmapIndex]?.heatmap?.length > 0 ? (
                                    <Heatmap heatmapData={data[activeHeatmapIndex].heatmap} asset={data[activeHeatmapIndex].asset}/>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                        <p className="font-medium">No performance data for {ALL_MONTHS[selectedMonth]} {selectedYear}.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Portfolio Breakdown</h2>
                    </div>
                    <HoldingsTable funds={data} />
                </section>
            </>
          )}
        </main>
      )}
      <Footer />
    </div>
  );
}

export default FundComparison;