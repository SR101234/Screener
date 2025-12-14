import { Flex, Image, Text, Button, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router";

const Tablenav = () => {
  const navigate = useNavigate();
  return (
    <Flex
      className="navbar glassmorph"
      align="center"
      justify="space-between"
      px={[4, 8]}
      py={[2, 3]}
      style={{
        position: "sticky",
        top: 0,
        width: "100%",
        zIndex: 100,
        background: "rgba(242, 242, 242, 0.39)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 4px 32px rgba(100, 22, 180, 0.11)"
      }}
    >
      <Flex align="center" cursor="pointer" onClick={() => navigate("/")}>
        <Image
          src="logo.png"
          alt="Logo"
          boxSize={["51px", "66px"]}
          borderRadius="full"
          mr="3"
          bg="white"
          p="0.5"
        />
        <Text
          fontSize={["xl", "2xl"]}
          fontWeight="bold"
          color="#000000ff"
          fontFamily="Montserrat"
          letterSpacing="1px"
        >
          SGC Screener
        </Text>
      </Flex>
      <HStack spacing={[8, 14]}>
        <Button
        mr="40px"
     
          variant="ghost"
          color="#000000ff"
          fontWeight="bold"
          fontFamily="Montserrat"
          fontSize={["sm", "md"]}
          onClick={() => navigate("/")}
          _hover={{ color: "#838383ff" }}
        >
          Home
        </Button>
        <Button
       mr="40px"
          variant="ghost"
          color="#000000ff"
          fontWeight="bold"
          fontFamily="Montserrat"
          fontSize={["sm", "md"]}
          onClick={() => navigate("/Screens")}
          _hover={{ color: "#838383ff" }}
        >
          MF Table
        </Button>
        <Button
       mr="40px"
          variant="ghost"
          color="#000000ff"
          fontWeight="bold"
          fontFamily="Montserrat"
          fontSize={["sm", "md"]}
          onClick={() => navigate("/FundComparison")}
          _hover={{ color: "#838383ff" }}
        >
          Fund Comparison
        </Button>
        <Button
       mr="40px"
          variant="ghost"
          color="#000000ff"
          fontWeight="bold"
          fontFamily="Montserrat"
          fontSize={["sm", "md"]}
          onClick={() => window.open("https://www.suigenerisconsulting.com/contact_us.php", "_blank")}
          _hover={{ color: "#838383ff"}}
        >
          Contact Us
        </Button>
      </HStack>
    </Flex>
  );
};

export default Tablenav;
