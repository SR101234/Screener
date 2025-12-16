import React, { useEffect, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import {
  Box,
  Flex,
  Image,
  Spinner,
  Text,
  Button,
} from "@chakra-ui/react";
import { DataGrid } from "@mui/x-data-grid";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useLocation, useParams } from "react-router-dom";
import Tablenav from "./Tablenav";
import Heatmap from "./Heatmap";
import Footer from "./Footer";

const ChartWrapper = ({ data }) => {

  const containerRef = useRef(null);
  const [width, setWidth] = useState(350);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <Box ref={containerRef} width="100%">
      <AreaChart data={data} width={width} height={300}>
        <defs>
          <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6e27ff" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#6e27ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e0e0e0" vertical={false} />
        <XAxis
          dataKey="markDate"
          tickFormatter={(d) => new Date(d).getFullYear()}
        />
        <YAxis tickLine={false} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="nav"
          stroke="#6e27ff"
          fill="url(#navGradient)"
          fillOpacity={0.3}
        />
      </AreaChart>
    </Box>
  );
};

const FundPage = () => {
  const [selectedRange, setSelectedRange] = useState("Max");
  const [filteredGraphData, setFilteredGraphData] = useState([]);
  const location = useLocation();
  const [fundName, setFundName] = useState({});
  const [rows, setRows] = useState([]);
  // 1. Add a dedicated loading state
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth <= 480;

  const getFilteredGraph = (range, graphData = []) => {
    const now = new Date();
    let fromDate = new Date();
    switch (range) {
      case "1D":
        fromDate.setDate(now.getDate() - 1);
        break;
      case "5D":
        fromDate.setDate(now.getDate() - 5);
        break;
      case "1M":
        fromDate.setMonth(now.getMonth() - 1);
        break;
      case "6M":
        fromDate.setMonth(now.getMonth() - 6);
        break;
      case "YTD":
        fromDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "1Y":
        fromDate.setFullYear(now.getFullYear() - 1);
        break;
      case "3Y":
        fromDate.setFullYear(now.getFullYear() - 3);
        break;
      case "5Y":
        fromDate.setFullYear(now.getFullYear() - 5);
        break;
      case "Max":
      default:
        return graphData;
    }
    fromDate.setHours(0, 0, 0, 0);
    const filtered = graphData.filter(
      (item) => new Date(item.markDate) >= fromDate
    );
    return filtered.length > 0 ? filtered : graphData;
  };

  const columns = [
    { field: "name", headerName: "Asset", flex: 1.5 },
    { field: "assetClass", headerName: "Asset Class", flex: 0.7 },
    { field: "sector", headerName: "Sector", flex: 1 },
    { field: "perc", headerName: "%Hold", flex: 0.5 },
  ];

  useEffect(() => {
    const search = location.search;
    const query = new URLSearchParams(search);
    const queryID = query.get("id");
    console.log(queryID);

    const openpage = async () => {
      try {
        // 2. Set loading to true before fetching
        setLoading(true);

        const response = await fetch(import.meta.env.VITE_BACKEND + `/api/MFinfo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: queryID }),
        });
        const res = await response.json();
        setRows(res.asset);
        setFundName(res);
        const fullGraph = res.graph || [];
        setFilteredGraphData(getFilteredGraph("Max", fullGraph));
      } catch (error) {
        console.error("Error fetching fund data:", error);
      } finally {
        // 3. Set loading to false after fetch (success or failure)
        setLoading(false);
      }
    };

    if (queryID) {
      openpage();
    }
  }, [location.search]);

  return (
    <>
      <div className="outerBody" style={{ backgroundColor: "white", minHeight: "100vh" }}>
        {/* Navbar */}
        <Tablenav />

        {/* 4. Use the loading state to conditionally render */}
        {loading ? (
          <Flex
            justify="center"
            align="center"
            h="80vh"
            direction="column"
            gap={4}
          >
            <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
            <Text fontSize="lg" color="gray.500" fontWeight="medium">Fetching Fund Data...</Text>
          </Flex>
        ) : fundName.MFName ? (
          <Box px={{ base: 4, md: "10%" }} py={0}>
            {/* Fund Header */}
            <Typography
              variant={isMobile ? "h5" : "h4"}
              gutterBottom
              textAlign="center"
              fontWeight="bold"
              mb={0}
            >
              {fundName.MFName}
            </Typography>

            <Typography
              variant={isMobile ? "h6" : "h5"}
              gutterBottom
              textAlign="left"
              mb={1}
              fontWeight="semibold"
            >
              Stocks Performance :
            </Typography>
            <Box mb={15} borderRadius="xl" boxShadow="lg">
              <Heatmap heatmapData={fundName.heatmap || []} />
            </Box>

            {/* Holdings Table */}
            <Typography
              variant={isMobile ? "h6" : "h5"}
              gutterBottom
              textAlign="left"
              mb={2}
              fontWeight="semibold"
            >
              Holdings:
            </Typography>
            <Box
              mb={10}
              borderRadius="xl"
              boxShadow="lg"
              overflow="auto"
              maxHeight={520}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.isin}
                pageSize={10}
                rowsPerPageOptions={[10]}
                hideFooter={true}
                rowHeight={50}
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#6e27ff20",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#6e27ff18",
                    fontWeight: "bold",
                  },
                }}
              />
            </Box>

            {/* Fund Info Cards */}
            <Flex
              wrap="wrap"
              justify="space-around"
              gap={6}
              mb={10}
            >
              {[
                { label: "NAV", value: fundName.nav },
                { label: "Inception Date", value: fundName.inception },
                { label: "%NAV Change", value: fundName.change },
                { label: "CAGR", value: fundName.cagr },
                { label: "Expense Ratio", value: fundName.ter },
              ].map((item, i) => (
                <Box
                  key={i}
                  minW="150px"
                  py={4}
                  px={6}
                  bg="#ffffff"
                  borderRadius="2xl"
                  boxShadow="0 10px 30px rgba(0,0,0,0.15)"
                  textAlign="center"
                  transition="all 0.3s"
                  _hover={{ transform: "scale(1.05)" }}
                >
                  <Text fontSize="sm" fontWeight="600" color="#555555">
                    {item.label}
                  </Text>
                  <Text fontSize="lg" fontWeight="700" color="#111111">
                    {item.value}
                  </Text>
                </Box>
              ))}
            </Flex>

            {/* Range Selector */}
            <Flex justify="center" gap={2} wrap="wrap" mb={10}>
              {["5D", "1M", "6M", "YTD", "1Y", "3Y", "5Y", "Max"].map((range) => (
                <Button
                  key={range}
                  size="sm"
                  bg={selectedRange === range ? "teal.400" : "gray.100"}
                  color={selectedRange === range ? "white" : "gray.700"}
                  borderRadius="xl"
                  _hover={{
                    bg: selectedRange === range ? "teal.500" : "gray.200",
                  }}
                  onClick={() => {
                    setSelectedRange(range);
                    setFilteredGraphData(
                      getFilteredGraph(range, fundName.graph || [])
                    );
                  }}
                >
                  {range}
                </Button>
              ))}
            </Flex>

            {/* Chart */}
            <ChartWrapper data={filteredGraphData} />

            {/* Exit Load */}
            <Box
              bg="#ffffff"
              py={6}
              px={6}
              borderRadius="2xl"
              boxShadow="0 10px 30px rgba(0,0,0,0.15)"
              mb={20}
              transition="all 0.3s"
              _hover={{ transform: "scale(1.03)", boxShadow: "2xl" }}
            >
              <Text fontWeight="semibold" mb={2}>
                Exit Load:
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                {fundName.exitload}
              </Text>
            </Box>
          </Box>
        ) : (
          <Flex justify="center" align="center" h="50vh">
            <Text fontSize="lg" color="red.500">Failed to load data. Please try again.</Text>
          </Flex>
        )}

        {/* Footer */}
        <Box mt={6}>
          <Footer />
        </Box>
      </div>
    </>
  );
};

export default FundPage;