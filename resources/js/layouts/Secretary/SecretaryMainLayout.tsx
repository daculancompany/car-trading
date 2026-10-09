import { useState } from "react";

import { Outlet } from "react-router-dom";

import DetailsProvider from "../../components/Shared/Details/DetailsProvider";

import {
  Box,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";

import Sidebar from "../Secretary/SecretarySidebar";
import MobileSidebar from "../Secretary/SecretaryMobileSidebar";
import Header from "../Secretary/SecretaryHeader";
import useAuthSync from "../../hooks/useAuthSync";

export default function SecretaryMainLayout() {
  useAuthSync("/login");

  const [collapsed, setCollapsed] = useState(false);

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const isDesktop = useBreakpointValue({
    base: false,
    lg: true,
  });

  const sidebarWidth = collapsed
    ? "80px"
    : "230px";

  const headerHeight = "45px";

  return (
    <Box
      h="100vh"
      overflow="hidden"
    >
      {isDesktop && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w={sidebarWidth}
          h="100vh"
          zIndex={1000}
        >
          <Sidebar
            collapsed={collapsed}
          />
        </Box>
      )}

      {!isDesktop && (
        <MobileSidebar
          isOpen={isOpen}
          onClose={onClose}
        />
      )}

      <Box
        position="fixed"
        top={0}
        left={isDesktop ? sidebarWidth : 0}
        right={0}
        h={headerHeight}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        zIndex={999}
      >
        <Header
          collapsed={collapsed}
          onToggle={() =>
            setCollapsed(!collapsed)
          }
          onOpenMobile={onOpen}
        />
      </Box>

      <Box
        ml={isDesktop ? sidebarWidth : 0}
        pt={headerHeight}
        h="100vh"
        overflow="hidden"
      >
        <Box
          h={`calc(100vh - ${headerHeight})`}
          overflowY="auto"
          overflowX="hidden"
          pt={{
            base: 3,
            md: 3,
            lg: 9,
          }}
          pb={{
            base: 4,
            md: 4,
            lg: 4,
          }}
          pl={{
            base: 3,
            sm: 4,
            md: 4,
            lg: 5,
          }}
          pr={{
            base: 3,
            sm: 4,
            md: 4,
            lg: 5,
          }}
          bg="gray.100"
        >
          <DetailsProvider>
            <Outlet />
          </DetailsProvider>
        </Box>
      </Box>
    </Box>
  );
}