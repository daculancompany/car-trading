import {
  Box,
  Button,
  Center,
  Heading,
  IconButton,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ArrowUpIcon } from "@heroicons/react/24/outline";

import CustomerPageHeader from "../../components/Customers/Vehicles/CustomerPageHeader";
import CustomerBrowseToolbar from "../../components/Customers/Vehicles/CustomerBrowseToolbar";
import VehicleGalleryModal from "../../components/Customers/Vehicles/VehicleGalleryModal";
import PublicHelpWidget from "../../components/Customers/Vehicles/PublicHelpWidget";
import CustomerFooter from "../../components/Customers/Vehicles/CustomerFooter";
import VehicleCard from "../../components/Shared/VehicleCard";
import CompareTray from "../../components/Shared/Vehicles/CompareTray";
import { useCompare } from "../../components/Shared/Vehicles/compare";

import {
  getVehicles,
  type Vehicle,
} from "../../api/VehicleManagement/vehicleApi";

export default function CustomerBrowseVehiclePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState("");

  const [selectedVehicle, setSelectedVehicle] =
    useState<Vehicle | null>(null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const compare = useCompare();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const target = Number(searchParams.get("vehicle"));
    if (!target || vehicles.length === 0) return;
    const match = vehicles.find((vehicle) => vehicle.id === target);
    setSearchParams({}, { replace: true });
    if (match) {
      setSelectedVehicle(match);
      setGalleryOpen(true);
    }
  }, [searchParams, setSearchParams, vehicles]);

  const [showBackToTop, setShowBackToTop] =
    useState(false);

  // LOAD VEHICLES

  useEffect(() => {
    loadVehicles();
  }, []);

  // BACK TO TOP SCROLL

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // API VEHICLES

  const loadVehicles = async () => {
    try {
      setLoading(true);

      const response = await getVehicles();

      setVehicles(
        response.filter(
          (vehicle) =>
            vehicle.status?.toLowerCase() ===
            "available"
        )
      );
    } catch (error) {
      console.error(
        "Failed to load vehicles:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // BRANDS FILTER

  const brands = useMemo(() => {
    return [
      ...new Set(
        vehicles
          .map(
            (vehicle) =>
              vehicle.brand?.brand
          )
          .filter(
            (
              brand
            ): brand is string =>
              Boolean(brand)
          )
      ),
    ].sort();
  }, [vehicles]);

  // SEARCH FILTER

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const keyword = `
                ${vehicle.brand?.brand ?? ""}
                ${vehicle.model?.model ?? ""}
                ${vehicle.variant?.variant ?? ""}
                ${vehicle.year_model ?? ""}
                ${vehicle.color ?? ""}
            `.toLowerCase();

      const matchesSearch =
        keyword.includes(
          search.toLowerCase().trim()
        );

      const matchesBrand =
        brand === "" ||
        vehicle.brand?.brand === brand;

      return (
        matchesSearch &&
        matchesBrand
      );
    });
  }, [
    vehicles,
    search,
    brand,
  ]);

  // PAGE

  return (
    <Box
      bg="gray.50"
      minH="100vh"
      display="flex"
      flexDirection="column"
    >
      {/* HEADER */}

      <CustomerPageHeader />

      {/* MAIN CONTENT */}

      <Box
        w="full"
        flex="1"
        px={{
          base: 3,
          sm: 4,
          md: 6,
          lg: 8,
        }}
        py={{
          base: 5,
          md: 6,
        }}
      >
        <Box
          w="full"
          maxW="1300px"
          mx="auto"
        >
          <Stack spacing={5}>
            {/* TOOLBAR */}

            <CustomerBrowseToolbar
              search={search}
              setSearch={setSearch}
              brand={brand}
              setBrand={setBrand}
              brands={brands}
            />

            {/* LOADING */}

            {loading && (
              <Center py={16}>
                <Stack
                  spacing={3}
                  align="center"
                >
                  <Spinner
                    size="lg"
                    color="brand.500"
                    thickness="4px"
                  />

                  <Text
                    fontSize="sm"
                    color="gray.500"
                  >
                    Loading available
                    vehicles...
                  </Text>
                </Stack>
              </Center>
            )}

            {/* VEHICLE GRID */}

            {!loading &&
              filteredVehicles.length >
              0 && (
                <SimpleGrid
                  w="full"
                  columns={{
                    base: 1,
                    sm: 2,
                    lg: 3,
                  }}
                  spacing={{
                    base: 4,
                    md: 5,
                  }}
                >
                  {filteredVehicles.map(
                    (vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        compare={{
                          selected: compare.ids.includes(vehicle.id),
                          disabled: compare.full,
                          onToggle: () => compare.toggle(vehicle.id),
                        }}
                        onImageClick={() => {
                          setSelectedVehicle(vehicle);
                          setGalleryOpen(true);
                        }}
                        footer={
                          <Button
                            w="full"
                            size="sm"
                            colorScheme="brand"
                            onClick={() => navigate("/login")}
                          >
                            Log in to reserve
                          </Button>
                        }
                      />
                    )
                  )}
                </SimpleGrid>
              )}

            {/* NO VEHICLES */}

            {!loading &&
              filteredVehicles.length ===
              0 && (
                <Center py={16}>
                  <Stack
                    spacing={2}
                    align="center"
                    textAlign="center"
                  >
                    <Heading
                      size="sm"
                      color="dark.700"
                    >
                      No cars match that search
                    </Heading>

                    <Text
                      color="gray.500"
                      fontSize="sm"
                    >
                      Try another brand or clear the search.
                    </Text>
                  </Stack>
                </Center>
              )}
          </Stack>

          {/* GALLERY MODAL */}

          <VehicleGalleryModal
            isOpen={galleryOpen}
            onClose={() =>
              setGalleryOpen(false)
            }
            vehicle={selectedVehicle}
          />

          {/* BACK TO TOP */}

          {showBackToTop && (
            <Box
              position="fixed"
              right={{
                base: "23px",
                sm: "40px",
              }}
              bottom={{
                base: "88px",
                sm: "96px",
              }}
              zIndex={1999}
            >
              <Tooltip
                label="Back To Top"
                placement="left"
                hasArrow
              >
                <IconButton
                  aria-label="Back to top"
                  icon={
                    <ArrowUpIcon
                      width={35}
                      height={36}
                      strokeWidth={2.5}
                    />
                  }
                  variant="ghost"
                  color="brand.600"
                  bg="transparent"
                  borderRadius="full"
                  w="35px"
                  h="35px"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: "transparent",
                    color: "brand.500",
                    transform:
                      "translateY(-2px)",
                  }}
                  onClick={
                    handleBackToTop
                  }
                />
              </Tooltip>
            </Box>
          )}

          <CompareTray vehicles={vehicles} ids={compare.ids} onToggle={compare.toggle} onClear={compare.clear} />

          {/* PUBLIC HELP / FAQ */}

          <PublicHelpWidget />
        </Box>
      </Box>

      {/* FOOTER */}

      <CustomerFooter />
    </Box>
  );
}

