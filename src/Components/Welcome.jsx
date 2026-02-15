// Welcome.jsx

import { Button, Input, useMediaQuery, Box, Flex, Image, Text } from "@chakra-ui/react";
import { TypeAnimation } from "react-type-animation";
import Footer from "./Footer";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import ListOfSearch from "./ListOfSearch";
import "./Welcome.css"; // Ensure you remove old .glassmorph styles from here or ignore them
import Navbar from "./Navbar";

// TODO: Import your gold logo image here. 
// Example: import GoldLogo from "../assets/gold-logo.png"; 
// For now, I will use a placeholder logic in the Image src below.

const Welcome = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [table, setTable] = useState([]);
  const [isMobile] = useMediaQuery("(max-width: 600px)");
  const navigate = useNavigate();

  const handleClick = () => navigate("/Screens");

  useEffect(() => {
    const collectTable = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_BACKEND + "/get_final_table"
        );
        const data = await response.json();
        console.log("Fetched table data:", data); // Debug log to check data structure
        setTable(data);
      } catch (error) {
        console.error("Failed to fetch table data", error);
      }
    };
    collectTable();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) return setFilteredFunds([]);

    setFilteredFunds(
      table.filter((name) =>
        name["Scheme"].toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  return (
    <Box
      w="100%"
      minH="100vh"
      bg="black"
      color="white"
      position="relative"
      overflowX="hidden"
    >
      {/* Navbar Wrapper */}
      <Box position="relative" zIndex={10}>
        <Navbar />
      </Box>

      {/* Main Content */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="85vh"
        px={4}
        pb={10}
      >
        {/* 1. ELEGANT GOLD LOGO */}
        {/* Replace 'src' with your actual imported image variable or path */}
        

        {/* 2. HEADING - No Boxes, High Contrast */}
        <Box textAlign="center" mb={4}>
          <Text
            as="span"
            fontSize={isMobile ? "1.8rem" : "3rem"}
            fontWeight="600"
            color="white"
            letterSpacing="tight"
          >
            Find the right pick with <br />
          </Text>

          <Box
            as="span"
            fontSize={isMobile ? "2rem" : "3.5rem"}
            fontWeight="bold"
            fontFamily="Montserrat, sans-serif"
            color="#D4AF37" // Elegant Gold Color
            textShadow="0px 0px 20px rgba(212, 175, 55, 0.4)" // Subtle glow
          >
            <TypeAnimation
              sequence={["Mutual Fund Screener"]}
              speed={30}
              cursor={false} 
            />
          </Box>
        </Box>

        {/* 3. SUBTITLE - Clean Grey Text */}
        <Text
          fontSize={isMobile ? "1rem" : "1.2rem"}
          color="gray.400"
          textAlign="center"
          maxWidth="600px"
          mb={10}
        >
          The tool you need to make wise & effective investment decisions
        </Text>

        {/* 4. BUTTON - Gold & Black Theme */}
        <Button
          onClick={handleClick}
          size="lg"
          bg="#D4AF37" // Gold background
          color="black"
          fontSize="1.1rem"
          fontWeight="bold"
          borderRadius="full" // Elegant rounded shape
          px={10}
          py={7}
          _hover={{
            bg: "#F5C518", // Lighter gold on hover
            transform: "translateY(-2px)",
            boxShadow: "0 4px 20px rgba(212, 175, 55, 0.4)",
          }}
          transition="all 0.3s ease"
          mb={12}
        >
          Enter in Screener
        </Button>

        {/* 5. SEARCH - Minimalist Style */}
        <Box width={isMobile ? "100%" : "500px"} position="relative">
          <Text
            textAlign="center"
            mb={3}
            fontWeight="500"
            color="gray.500"
            fontSize="0.9rem"
            letterSpacing="1px"
            textTransform="uppercase"
          >
            Search Scheme Name
          </Text>

          <Flex
            align="center"
            borderBottom="1px solid"
            borderColor="gray.600"
            pb={2}
            transition="border-color 0.3s"
            _focusWithin={{ borderColor: "#D4AF37" }}
          >
            <BiSearch color="#D4AF37" size={24} />
            <Input
              placeholder="e.g. HDFC Top 100..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="unstyled"
              color="black"
              background={"white"}
              fontSize="1.2rem"
              ml={3}
              pl={3}
              _placeholder={{ color: "gray.600" }}
            />
          </Flex>

          {/* Search Dropdown Results */}
          {filteredFunds.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              bg="#111" // Dark grey bg for dropdown
              border="1px solid #333"
              mt={2}
              borderRadius="md"
              maxH="250px"
              overflowY="auto"
              zIndex={20}
              boxShadow="0 10px 30px rgba(0,0,0,0.8)"
            >
              <ListOfSearch params={{ filteredFunds, table }} />
            </Box>
          )}
        </Box>
      </Flex>

      <Footer />
    </Box>
  );
};

export default Welcome;