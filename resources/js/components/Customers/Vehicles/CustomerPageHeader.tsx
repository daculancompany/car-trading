import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Icon,
  Image,
  Spacer,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";

import {
  InformationCircleIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import Logo from "../../../assets/logo/logo.jpg";
import ContactModal from "./ContactModal";
import CustomerRegisterModal from "../../../pages/Customer/CustomerRegister";
import { getHomePath, getToken, getUser } from "../../../utils/auth";

export default function CustomerPageHeader() {
  const navigate = useNavigate();

  const {
    isOpen: isContactOpen,
    onOpen: onContactOpen,
    onClose: onContactClose,
  } = useDisclosure();

  const {
    isOpen: isRegisterOpen,
    onOpen: onRegisterOpen,
    onClose: onRegisterClose,
  } = useDisclosure();

  const handleAboutClick = () => navigate("/about");

  const user = getUser();
  const homePath = getToken() && user ? getHomePath(user) : null;

  return (
    <Box
      bg="dark.800"
      borderBottom="1px solid"
      borderColor="dark.600"
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.25)"
      position="sticky"
      top={0}
      zIndex={1000}
      w="full"
    >
      <Container
        maxW="7xl"
        w="full"
        px={{
          base: 3,
          sm: 4,
          md: 6,
          lg: 8,
        }}
        py={{
          base: 2.5,
          md: 3,
        }}
      >
        <Flex
          align="center"
          minH="54px"
          w="full"
          gap={{
            base: 1,
            sm: 2,
            md: 3,
          }}
        >
          {/* BRAND */}

          <HStack
            spacing={{
              base: 1,
              sm: 2,
              md: 3,
            }}
            cursor="pointer"
            onClick={() =>
              navigate("/browse-vehicles")
            }
            minW={0}
            flexShrink={1}
          >
            {/* LOGO */}

            <Image
              src={Logo}
              alt="CDO Car Trading"
              w={{
                base: "72px",
                sm: "82px",
                md: "92px",
              }}
              h={{
                base: "42px",
                sm: "46px",
                md: "50px",
              }}
              objectFit="contain"
              flexShrink={0}
            />

            {/* BRAND TEXT */}

            <VStack
              align="start"
              spacing={0}
              minW={0}
              display={{
                base: "none",
                sm: "flex",
              }}
            >
              {/* Highlighted Company Name */}

              <Text
                fontSize={{
                  sm: "md",
                  md: "lg",
                }}
                fontWeight="800"
                color="white"
                letterSpacing="0.04em"
                lineHeight="1.15"
                textShadow="0 1px 8px rgba(255,255,255,0.12)"
                whiteSpace="nowrap"
              >
                CDO CAR TRADING
              </Text>

              {/* Accent Line */}

              <Flex
                align="center"
                gap={2}
                mt={1}
                minW={0}
              >
                <Box
                  w="24px"
                  h="2px"
                  bg="brand.400"
                  borderRadius="full"
                  flexShrink={0}
                />

                <Text
                  fontSize="xs"
                  color="gray.300"
                  lineHeight="1.3"
                  whiteSpace="nowrap"
                  display={{
                    base: "none",
                    md: "block",
                  }}
                >
                  Opol · Cagayan de Oro
                </Text>
              </Flex>
            </VStack>
          </HStack>

          <Spacer />

          {/* NAVIGATION */}

          <HStack
            spacing={{
              base: 0,
              sm: 1,
              md: 2,
            }}
            flexShrink={0}
          >
            {/* ABOUT US */}

            <Button
              variant="ghost"
              size="sm"
              minW={{
                base: "40px",
                md: "auto",
              }}
              px={{
                base: 2,
                sm: 2,
                md: 3,
              }}
              leftIcon={
                <Icon
                  as={InformationCircleIcon}
                  boxSize={5}
                  color="brand.400"
                  _groupHover={{
                    color: "white",
                  }}
                />
              }
              color="white"
              fontWeight="600"
              borderRadius="lg"
              role="group"
              _hover={{
                bg: "brand.600",
                color: "white",
              }}
              _active={{
                bg: "brand.600",
                color: "white",
              }}
              onClick={handleAboutClick}
            >
              <Text
                display={{
                  base: "none",
                  md: "block",
                }}
                color="white"
              >
                About Us
              </Text>
            </Button>

            {/* CONTACT */}

            <Button
              variant="ghost"
              size="sm"
              minW={{
                base: "40px",
                md: "auto",
              }}
              px={{
                base: 2,
                sm: 2,
                md: 3,
              }}
              leftIcon={
                <Icon
                  as={PhoneIcon}
                  boxSize={5}
                  color="brand.400"
                  _groupHover={{
                    color: "white",
                  }}
                />
              }
              color="white"
              fontWeight="600"
              borderRadius="lg"
              role="group"
              _hover={{
                bg: "brand.600",
                color: "white",
              }}
              _active={{
                bg: "brand.600",
                color: "white",
              }}
              onClick={onContactOpen}
            >
              <Text
                display={{
                  base: "none",
                  md: "block",
                }}
                color="white"
              >
                Contact
              </Text>
            </Button>

            {/* LOGIN */}

            <Button
              variant="ghost"
              size="sm"
              minW={{
                base: "40px",
                md: "auto",
              }}
              px={{
                base: 2,
                sm: 2,
                md: 3,
              }}
              leftIcon={
                <Icon
                  as={homePath ? Squares2X2Icon : ArrowRightOnRectangleIcon}
                  boxSize={5}
                  color="brand.400"
                  _groupHover={{
                    color: "white",
                  }}
                />
              }
              color="white"
              fontWeight="600"
              borderRadius="lg"
              role="group"
              _hover={{
                bg: "brand.600",
                color: "white",
              }}
              _active={{
                bg: "brand.600",
                color: "white",
              }}
              onClick={() =>
                navigate(homePath ?? "/login")
              }
            >
              <Text
                display={{
                  base: "none",
                  sm: "block",
                }}
                color="white"
              >
                {homePath ? "Dashboard" : "Login"}
              </Text>
            </Button>

            {/* REGISTER */}

            {!homePath && (
            <Button
              variant="ghost"
              size="sm"
              minW={{
                base: "40px",
                md: "auto",
              }}
              px={{
                base: 2,
                sm: 2,
                md: 3,
              }}
              leftIcon={
                <Icon
                  as={UserPlusIcon}
                  boxSize={5}
                  color="brand.400"
                  _groupHover={{
                    color: "white",
                  }}
                />
              }
              color="white"
              fontWeight="600"
              borderRadius="lg"
              role="group"
              _hover={{
                bg: "brand.600",
                color: "white",
              }}
              _active={{
                bg: "brand.600",
                color: "white",
              }}
              onClick={onRegisterOpen}
            >
              <Text
                display={{
                  base: "none",
                  sm: "block",
                }}
                color="white"
              >
                Register
              </Text>
            </Button>
            )}
          </HStack>
        </Flex>
      </Container>

      <ContactModal
        isOpen={isContactOpen}
        onClose={onContactClose}
      />

      <CustomerRegisterModal
        isOpen={isRegisterOpen}
        onClose={onRegisterClose}
      />
    </Box>
  );
}
