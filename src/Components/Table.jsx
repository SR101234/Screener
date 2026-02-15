import { useEffect, useState, useCallback, useRef } from "react";
import { DataGrid, GridOverlay } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import "./Table.css";
import { Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import Filters from "./Filters.jsx";
import { Button, Drawer } from "@mui/material";
import Tablenav from "./Tablenav.jsx";
import Footer from "./Footer.jsx";

// Custom loading overlay
function CustomLoadingOverlay() {
  return (
    <GridOverlay>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(8px)",
          zIndex: 10,
        }}
      >
        <CircularProgress />
      </Box>
    </GridOverlay>
  );
}

export default function Table() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredRows, setFilteredRows] = useState([]);
  const isMounted = useRef(false);

  // Initialize with current date to match Filters default
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [open, setOpen] = useState(false);

  // Handle client-side filters (Asset class, AUM, etc.)
  const handleFilterChange = useCallback((newRows) => {
    setFilteredRows(newRows);
  }, []);

  // Handle Date Change (Triggers API Refetch)
  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);


  }, []);

  // Fetch data from backend whenever selectedDate changes
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_BACKEND;
        const url = new URL(baseUrl);
        url.searchParams.append("month", selectedDate.month);
        url.searchParams.append("year", selectedDate.year);

        const res = await fetch(url.toString());
        const data = await res.json();

        // --- NEW: Safety Check ---
        if (!Array.isArray(data)) {
          console.error("Backend returned an error:", data);
          // Stop execution if data is not an array
          setRows([]);
          setFilteredRows([]);
          return;
        }
        // -------------------------

        const formatted = data.map((item, index) => ({
          id: item.ISIN || index,
          isin: item.ISIN,
          scheme: item.Scheme,
          category: item.Category,
          assetClass: item.Asset_Class,
          aum: parseFloat(item.AUM || 0),
          pe: parseFloat(item.PE || 0),
          nav: parseFloat(item.NAV || 0),
          equity: parseFloat(item.Equity || 0),
          score: parseFloat(item.Score || 0),
        }));

        setRows(formatted);
        setFilteredRows(formatted);

      } catch (err) {
        console.error("Error fetching data:", err);
        setRows([]);
        setFilteredRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]); // Dependency on selectedDate ensures re-fetch on change

  const handleRowClick = (id) => {
    window.open(`${window.location.origin}/MFinfo?id=${id}&d=${selectedDate.month}-${selectedDate.year}`, "_blank");
  };

  const columns = [
    {
      field: "scheme",
      headerName: "Scheme",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <a
          href={`/MFinfo?id=${params.row.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
        >
          {params.value}
        </a>
      ),
    },
    {
      field: "score",
      headerName: "Score",
      type: "number",
      flex: 0.6,
      minWidth: 100,
      valueFormatter: (value) => value?.toFixed(2)
    },
    { field: "category", headerName: "Category", flex: 1, minWidth: 120 },
    
    { field: "assetClass", headerName: "Asset Class", flex: 1, minWidth: 120 },
    {
      field: "aum",
      headerName: "AUM (Cr.)",
      type: "number",
      flex: 0.7,
      minWidth: 100,
      valueFormatter: (value) => value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })
    },
    {
      field: "pe",
      headerName: "ExpRatio",
      type: "number",
      flex: 0.5,
      minWidth: 80,
      valueFormatter: (value) => value?.toFixed(2)
    },
    {
      field: "equity",
      headerName: "% Equity",
      type: "number",
      flex: 0.6,
      minWidth: 100,
      valueFormatter: (value) => `${value?.toFixed(2)}%`
    },
  ];

  const today = new Date();
const todayDay = today.getDate();

// Determine the "effective month/year" for NAV
let effectiveMonth = today.getMonth() + 1; // JS month is 0-based
let effectiveYear = today.getFullYear();

// If before 15th, NAV still belongs to previous month
if (todayDay < 15) {
  effectiveMonth -= 1;
  if (effectiveMonth === 0) {
    effectiveMonth = 12;
    effectiveYear -= 1;
  }
}

// Show column only if selected date matches effective period
if (
  selectedDate.month === effectiveMonth &&
  selectedDate.year === effectiveYear
) {
  columns.splice(3, 0, {
    field: "nav",
    headerName: "Curr. NAV",
    type: "number",
    flex: 0.5,
    minWidth: 80,
    valueFormatter: (value) => value?.toFixed(2),
  });
}


  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box position="sticky" top={64} height="fit-content" px={2} width={isMobile ? 280 : 320}>
      <Filters
        rows={rows}
        onFilterChange={handleFilterChange}
        onDateChange={handleDateChange}
      />
    </Box>
  );

  return (
    <>
      <div style={{ backgroundColor: "white" }}>
        <Tablenav />

        <Box
          className="tableOuter"
          sx={{
            marginBottom: "5%",
            marginTop: isMobile ? "15%" : "1%",
            overflowX: isMobile ? "auto" : "visible",
          }}
        >
          <Flex>
            {/* Filters Sidebar (Desktop) */}
            {!isMobile && (
              <Box
                flex={1}
                position="sticky"
                top={64}
                height="fit-content"
                maxWidth="20%"
              >
                <Filters
                  rows={rows}
                  onFilterChange={handleFilterChange}
                  onDateChange={handleDateChange}
                />
              </Box>
            )}

            {/* DataGrid */}
            <Box
              flex={4}
              sx={{
                height: 900,
                p: 2,
                maxWidth: isMobile ? "100%" : "80%",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(16px)",
                borderRadius: "18px",
                boxShadow: "0 8px 32px rgba(31, 38, 135, 0.2)",
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontSize: isMobile ? "1rem" : "1.25rem",
                  mb: 3,
                  fontFamily: "Montserrat",
                  color: "#4a4a7b",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>Mutual Fund Summary</span>
                {/* Optional: Show currently selected date context */}
                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  Data for: {selectedDate.month}/{selectedDate.year}
                </span>
              </Typography>

              <DataGrid
                rows={filteredRows}
                columns={columns}
                pageSize={10}
                getRowId={(row) => row.id}
                onRowClick={(params) => handleRowClick(params.id)}
                rowHeight={40}
                loading={loading}
                slots={{ loadingOverlay: CustomLoadingOverlay }}
                initialState={{
                  sorting: {
                    sortModel: [{ field: "score", sort: "desc" }],
                  },
                }}
                sx={{
                  border: "none",
                  fontFamily: "Montserrat",
                  backgroundColor: "#fff",
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#6e27ff18",
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#eb03ff10",
                    cursor: "pointer",
                  },
                }}
              />
            </Box>
          </Flex>
        </Box>

        {/* Mobile Filters Drawer */}
        {isMobile && (
          <Box
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            zIndex={1500}
            display="flex"
            justifyContent="center"
            p={1}
            backgroundColor="white"
            boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
          >
            <Button
              variant="contained"
              onClick={toggleDrawer(true)}
              sx={{ width: "100%", bgcolor: "#6e27ff", color: "white", fontWeight: "bold" }}
            >
              Apply Filters
            </Button>
            <Drawer anchor="bottom" open={open} onClose={toggleDrawer(false)}>
              {DrawerList}
            </Drawer>
          </Box>
        )}
      </div>
      <Footer />
    </>
  );
}