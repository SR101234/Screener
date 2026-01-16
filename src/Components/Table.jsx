import { useEffect, useState, useCallback } from "react";
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
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [open, setOpen] = useState(false);

  // Handle filters
  const handleFilterChange = useCallback((newRows) => {
    setFilteredRows(newRows);
  }, []);

  // Fetch data from backend
  useEffect(() => {
    // const cached = localStorage.getItem("mfData");

    // if (cached) {
    //   const parsed = JSON.parse(cached);
    //   if (Date.now() - parsed.time < 86400) {
    //     setRows(parsed.data);
    //     setFilteredRows(parsed.data);
    //     setLoading(false);
    //     return;
    //   }
    // }

    const fetchData = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_BACKEND);
        const data = await res.json();

        const formatted = data.map((item, index) => ({
          id: item.ISIN || index,
          isin: item.ISIN,
          scheme: item.Scheme,
          category: item.Category,
          assetClass: item.Asset_Class,
          // Store as Numbers to allow correct sorting
          aum: parseFloat(item.AUM || 0),
          pe: parseFloat(item.PE || 0),
          nav: parseFloat(item.NAV || 0),
          equity: parseFloat(item.Equity || 0),
          score: parseFloat(item.Score || 0),
        }));

        setRows(formatted);
        setFilteredRows(formatted);

        localStorage.setItem(
          "mfData",
          JSON.stringify({ time: Date.now(), data: formatted })
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (id) => {
    window.open(`${window.location.origin}/MFinfo?id=${id}`, "_blank");
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
    { 
        field: "nav", 
        headerName: "NAV", 
        type: "number", 
        flex: 0.5, 
        minWidth: 80,
        valueFormatter: (value) => value?.toFixed(2)
    },
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

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box position="sticky" top={64} height="fit-content" px={2} width={isMobile ? 280 : 320}>
      <Filters rows={rows} onFilterChange={handleFilterChange} />
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
            {/* Filters Sidebar */}
            {!isMobile && (
              <Box
                flex={1}
                position="sticky"
                top={64}
                height="fit-content"
                maxWidth="20%"
              >
                <Filters rows={rows} onFilterChange={handleFilterChange} />
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
                }}
              >
                Mutual Fund Summary
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