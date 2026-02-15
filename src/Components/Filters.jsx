import { useState, useEffect, useMemo } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  TextField,
  Slider,
  Button,
  Box,
} from "@mui/material";
import { Separator } from "@chakra-ui/react";

/* -------------------- Debounce -------------------- */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

/* -------------------- Helpers -------------------- */
// Data is added on 15th of every month
function getLatestAvailablePeriod() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth(); // 0-based
  const year = today.getFullYear();

  if (day >= 15) {
    return { month, year };
  } else {
    if (month === 0) return { month: 11, year: year - 1 };
    return { month: month - 1, year };
  }
}

/* -------------------- Constants -------------------- */
const assetClassOptions = [
  "Equity",
  "Debt",
  "Solution Oriented",
  "Other",
  "Hybrid",
];

const categoryOptions = [
  "Aggressive Hybrid Fund",
  "Arbitrage Fund",
  "Balanced Hybrid Fund",
  "Banking and PSU Fund",
  "Childrens Fund",
  "Conservative Hybrid Fund",
  "Contra Fund",
  "Corporate Bond Fund",
  "Credit Risk Fund",
  "Debt Index Funds",
  "Dividend Yield Fund",
  "Dynamic Asset Allocation or Balanced Advantage",
  "Dynamic Bond",
  "ELSS",
  "Equity",
  "Equity Index Funds",
  "Equity Savings",
  "Flexi Cap Fund",
  "Floater Fund",
  "FoFs Domestic",
  "FoFs Overseas",
  "Focused Fund",
  "Gilt Fund",
  "Gilt Fund with 10 year Constant duration",
  "Large & Mid Cap Fund",
  "Large Cap Fund",
  "Liquid Fund",
  "Long Duration Fund",
  "Low Duration Fund",
  "Medium Duration Fund",
  "Medium to Long Duration Fund",
  "Mid Cap Fund",
  "Money Market Fund",
  "Multi Asset Allocation",
  "Multi Cap Fund",
  "Overnight Fund",
  "Passive ELSS",
  "Retirement Fund",
  "Sectoral: Auto",
  "Sectoral: Banking",
  "Sectoral: FMCG",
  "Sectoral: Foreign Equity",
  "Sectoral: Infotech",
  "Sectoral: Other Sectoral",
  "Sectoral: Pharma",
  "Short Duration Fund",
  "Small Cap Fund",
  "Ultra Short Duration Fund",
  "Value Fund",
];

const allMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MenuProps = {
  PaperProps: { style: { maxHeight: 220, width: 260 } },
};

/* -------------------- Component -------------------- */
const Filters = ({ rows = [], onFilterChange, onDateChange }) => {
  const latestPeriod = useMemo(getLatestAvailablePeriod, []);

  /* -------------------- Date State -------------------- */
  const [selectedMonth, setSelectedMonth] = useState(latestPeriod.month);
  const [selectedYear, setSelectedYear] = useState(latestPeriod.year);

  const years = useMemo(() => {
    const startYear = latestPeriod.year;
    return Array.from({ length: 1 }, (_, i) => startYear - i);
  }, [latestPeriod.year]);

  const availableMonths = useMemo(() => {
    return allMonths.filter((_, index) => {
      if (selectedYear < latestPeriod.year) return true;
      if (selectedYear > latestPeriod.year) return false;
      return index <= latestPeriod.month;
    });
  }, [selectedYear, latestPeriod]);

  /* -------------------- Filters State -------------------- */
  const [assetClass, setAssetClass] = useState([]);
  const [category, setCategory] = useState([]);
  const [mfName, setMfName] = useState("");
  const [aum, setAum] = useState([0, 100000]);
  const [ter, setTer] = useState([0, 4]);
  const [equity, setEquity] = useState([0, 100]);
  const [score, setScore] = useState([0, 100]);

  const [assetClassOpen, setAssetClassOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const debouncedMfName = useDebounce(mfName);
  const debouncedAum = useDebounce(aum);
  const debouncedTer = useDebounce(ter);

  /* -------------------- Effects -------------------- */

  // Guard invalid month when year changes
  useEffect(() => {
    if (
      selectedYear === latestPeriod.year &&
      selectedMonth > latestPeriod.month
    ) {
      setSelectedMonth(latestPeriod.month);
    }
  }, [selectedYear, latestPeriod, selectedMonth]);

  // Notify parent on date change
  useEffect(() => {
    onDateChange?.({
      month: selectedMonth + 1,
      year: selectedYear,
    });
  }, [selectedMonth, selectedYear, onDateChange]);

  // Client-side filtering
  useEffect(() => {
    if (!Array.isArray(rows)) return;

    const filtered = rows.filter((row) => {
      if (assetClass.length && !assetClass.includes(row.assetClass)) return false;
      if (
        category.length &&
        !category.some(
          (c) => row.category?.toLowerCase() === c.toLowerCase()
        )
      )
        return false;
      if (
        debouncedMfName &&
        !row.scheme?.toLowerCase().includes(debouncedMfName.toLowerCase())
      )
        return false;
      if (row.aum < debouncedAum[0] || row.aum > debouncedAum[1]) return false;
      if (row.pe < debouncedTer[0] || row.pe > debouncedTer[1]) return false;
      if (row.equity < equity[0] || row.equity > equity[1]) return false;
      if (row.score < score[0] || row.score > score[1]) return false;

      return true;
    });

    onFilterChange(filtered);
  }, [
    assetClass,
    category,
    debouncedMfName,
    debouncedAum,
    debouncedTer,
    equity,
    score,
    rows,
    onFilterChange,
  ]);

  /* -------------------- Clear -------------------- */
  const clearAllFilters = () => {
    setAssetClass([]);
    setCategory([]);
    setMfName("");
    setAum([0, 100000]);
    setTer([0, 4]);
    setEquity([0, 100]);
    setScore([0, 100]);
    onFilterChange(rows);
  };

  /* -------------------- UI -------------------- */
  return (
    <div style={{ maxWidth: 320, margin: "0 auto", padding: "8%" }}>
      <Typography variant="h6" fontWeight="bold" align="center">
        Filter
      </Typography>

      <Separator my={3} />

      {/* Period */}
      <Typography variant="subtitle2" fontWeight="bold">
        Period
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Month</InputLabel>
          <Select
            value={selectedMonth}
            label="Month"
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {availableMonths.map((month, index) => (
              <MenuItem key={month} value={index}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Separator my={3} />

      {/* Asset Class */}
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Asset Class</InputLabel>
        <Select
          multiple
          value={assetClass}
          open={assetClassOpen}
          onOpen={() => setAssetClassOpen(true)}
          onClose={() => setAssetClassOpen(false)}
          onChange={(e) => {
            setAssetClass(e.target.value);
            setAssetClassOpen(false);
          }}
          input={<OutlinedInput label="Asset Class" />}
          renderValue={(selected) => selected.join(", ")}
          MenuProps={MenuProps}
        >
          {assetClassOptions.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={assetClass.includes(name)} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Category */}
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Category</InputLabel>
        <Select
          multiple
          value={category}
          open={categoryOpen}
          onOpen={() => setCategoryOpen(true)}
          onClose={() => setCategoryOpen(false)}
          onChange={(e) => {
            setCategory(e.target.value);
            setCategoryOpen(false);
          }}
          input={<OutlinedInput label="Category" />}
          renderValue={(selected) => selected.join(", ")}
          MenuProps={MenuProps}
        >
          {categoryOptions.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={category.includes(name)} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* MF Name */}
      <TextField
        label="Mutual Fund Name"
        fullWidth
        size="small"
        margin="normal"
        value={mfName}
        onChange={(e) => setMfName(e.target.value)}
      />

      {/* Sliders */}
      <Typography mt={2}>AUM (Cr.)</Typography>
      <Slider value={aum} onChange={(e, v) => setAum(v)} min={0} max={100000} step={1000} valueLabelDisplay="auto" color="black" />

      <Typography mt={2}>Expense Ratio</Typography>
      <Slider value={ter} onChange={(e, v) => setTer(v)} min={0} max={4} step={0.1} valueLabelDisplay="auto" color="black"/>

      <Typography mt={2}>Equity %</Typography>
      <Slider value={equity} onChange={(e, v) => setEquity(v)} min={0} max={100} valueLabelDisplay="auto" color="black"/>

      <Typography mt={2}>Score</Typography>
      <Slider value={score} onChange={(e, v) => setScore(v)} min={0} max={100} valueLabelDisplay="auto" color="black"/>

      <Button fullWidth variant="outlined" sx={{ mt: 3 }} onClick={clearAllFilters}>
        Clear All
      </Button>
    </div>
  );
};

export default Filters;
