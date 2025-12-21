import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Separator } from "@chakra-ui/react";

// Defensive debounce
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const assetClassOptions = ["Equity", "Debt", "Solution Oriented", "Other", "Hybrid"];
const categoryOptions = [
 'Aggressive Hybrid Fund', 'Arbitrage Fund', 'Balanced Hybrid Fund', 'Banking and PSU Fund', 'Childrens Fund', 'Conservative Hybrid Fund', 'Contra Fund', 'Corporate Bond Fund', 'Credit Risk Fund', 'Debt Index Funds', 'Dividend Yield Fund', 'Dynamic Asset Allocation or Balanced Advantage', 'Dynamic Bond', 'ELSS', 'Equity', 'Equity Index Funds', 'Equity Savings', 'Flexi Cap Fund', 'Floater Fund', 'FoFs Domestic', 'FoFs Overseas', 'Focused Fund', 'Gilt Fund', 'Gilt Fund with 10 year Constant duration', 'Large & Mid Cap Fund', 'Large Cap Fund', 'Liquid Fund', 'Long Duration Fund', 'Low Duration Fund', 'Medium Duration Fund', 'Medium to Long Duration Fund', 'Mid Cap Fund', 'Money Market Fund', 'Multi Asset Allocation', 'Multi Cap Fund', 'Overnight Fund', 'Passive ELSS', 'Retirement Fund', 'Sectoral: Auto', 'Sectoral: Banking', 'Sectoral: FMCG', 'Sectoral: Foreign Equity', 'Sectoral: Infotech', 'Sectoral: Other Sectoral', 'Sectoral: Pharma', 'Short Duration Fund', 'Small Cap Fund', 'Ultra Short Duration Fund', 'Value Fund'
];
const MenuProps = {
  PaperProps: { style: { maxHeight: 220, width: 250 } }
};

const Filters = ({ rows = [], onFilterChange }) => {
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

  const clearAllFilters = () => {
    setAssetClass([]);
    setCategory([]);
    setMfName("");
    setAum([0, 100000]);
    setTer([0, 4]);
    onFilterChange(Array.isArray(rows) ? rows : []);
  };

 useEffect(() => {
  if (!Array.isArray(rows)) return;
  const filtered = rows.filter((row) => {

    if (assetClass.length && !assetClass.includes(row.assetClass)) return false;
    if (category.length && !category.some(cat => row.category?.toLowerCase().includes(cat.toLowerCase()))) return false;
    if (debouncedMfName && !row.scheme.toLowerCase().includes(debouncedMfName.toLowerCase())) return false;
    if (row.aum < debouncedAum[0] || row.aum > debouncedAum[1]) return false;
    if (row.pe < debouncedTer[0] || row.pe > debouncedTer[1]) return false;
    if (row.equity < equity[0] || row.equity > equity[1]) return false;

    if (row.score < score[0] || row.score > score[1]) return false;
    return true;
  });
  onFilterChange(filtered);
}, [assetClass, category, debouncedMfName, debouncedAum, debouncedTer, equity, score, rows, onFilterChange]);


  return (
    <div style={{
      maxWidth: 320, margin: "0 auto",
      fontFamily: "'Montserrat', sans-serif", color: "#000000ff",
      padding:"8%"
    }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" align="center">
         Filter
      </Typography>
      <Separator mb={3} />

      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Asset Class</InputLabel>
        <Select
          multiple
          value={assetClass}
          open={assetClassOpen}
          onOpen={() => setAssetClassOpen(true)}
          onClose={() => setAssetClassOpen(false)}
          onChange={e => {setAssetClass(e.target.value); setAssetClassOpen(false);}}
          input={<OutlinedInput label="Asset Class" />}
          renderValue={selected => selected.join(", ")}
          MenuProps={MenuProps}
        >
          {assetClassOptions.map(name => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={assetClass.includes(name)} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Category</InputLabel>
        <Select
          multiple
          value={category}
          open={categoryOpen}
          onOpen={() => setCategoryOpen(true)}
          onClose={() => setCategoryOpen(false)}
          onChange={e => {setCategory(e.target.value); setCategoryOpen(false)}}
          input={<OutlinedInput label="Category" />}
          renderValue={selected => selected.join(", ")}
          MenuProps={MenuProps}
        >
          {categoryOptions.map(name => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={category.includes(name)} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Mutual Fund Name"
        variant="outlined"
        fullWidth
        size="small"
        margin="normal"
        value={mfName}
        onChange={e => setMfName(e.target.value)}
      />

      <Typography sx={{ mt: 2 }} fontWeight="medium">AUM (Cr.)</Typography>
      <Slider
        value={aum}
        onChange={(e, val) => setAum(val)}
        valueLabelDisplay="auto"
        min={0}
        max={100000}
        step={1000}
        sx={{ color: "#000000ff" }}
      />

      <Typography sx={{ mt: 2 }} fontWeight="medium">Expense Ratio</Typography>
      <Slider
        value={ter}
        onChange={(e, val) => setTer(val)}
        valueLabelDisplay="auto"
        min={0}
        max={4}
        step={0.1}
        sx={{ color: "#000000ff" }}
      />
       {/* Equity */}
      <Typography sx={{ mt: 3 }} fontWeight="medium">
        Equity %
      </Typography>
      <Slider
        value={equity}
        onChange={(e, val) => setEquity(val)}
        valueLabelDisplay="auto"
        getAriaValueText={(val) => `${val}%`}
        min={0}
        max={100}
        step={1}
        sx={{ color: "#000000ff" }}
      />

      {/* Score */}
      <Typography sx={{ mt: 3 }} fontWeight="medium">
        Score
      </Typography>
      <Slider
        value={score}
        onChange={(e, val) => setScore(val)}
        valueLabelDisplay="auto"
        getAriaValueText={(val) => `${val}`}
        min={0}
        max={100}
        step={1}
        sx={{ color: "#000000ff" }}
      />


      <Button
        variant="outlined"
        color="primary"
        fullWidth
        sx={{ mt: 3, fontWeight: "bold", borderColor: "#000000ff", color: "#000000ff" }}
        onClick={clearAllFilters}
      >Clear All</Button>
    </div>
  );
};

export default Filters;
