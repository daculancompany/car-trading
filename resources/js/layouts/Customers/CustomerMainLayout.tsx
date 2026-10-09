import { useState } from "react";

import { Outlet } from "react-router-dom";

import {
  Box,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";

import Sidebar from "./CustomerSidebar";
import MobileSidebar from "../Customers/CustomerMobileSidebar";
import Header from "./CustomerHeader";
import CustomerBottomNav, { BOTTOM_NAV_HEIGHT } from "./CustomerBottomNav";
import { InstallBanner } from "../../components/Shared/InstallApp";

import useAuthSync from "../../hooks/useAuthSync";

export default function CustomerMainLayout() {
  // CROSS-TAB AUTHENTICATION SYNC

  useAuthSync("/login");

  const [collapsed, setCollapsed] =
    useState(false);

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const isDesktop = useBreakpointValue({
    base: false,
    lg: true,
  });

  // Layout Sizing

  const sidebarWidth = collapsed
    ? "80px"
    : "230px";

  const headerHeight = "45px";

  // Render

  return (
    <Box
      h="100vh"
      overflow="hidden"
    >
      {/* DESKTOP SIDEBAR */}

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

      {/* MOBILE SIDEBAR */}

      {!isDesktop && (
        <MobileSidebar
          isOpen={isOpen}
          onClose={onClose}
        />
      )}

      {/* HEADER */}

      <Box
        position="fixed"
        top={0}
        left={
          isDesktop
            ? sidebarWidth
            : 0
        }
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
            setCollapsed(
              !collapsed,
            )
          }
          onOpenMobile={onOpen}
        />
      </Box>

      {/* CONTENT */}

      <Box
        ml={
          isDesktop
            ? sidebarWidth
            : 0
        }
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
pb={isDesktop ? 4 : `calc(${BOTTOM_NAV_HEIGHT} + 16px + env(safe-area-inset-bottom))`}
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
          <InstallBanner />
          <Outlet />
        </Box>
      </Box>

      {/* PHONE TAB BAR */}

      {!isDesktop && <CustomerBottomNav onMore={onOpen} />}

    </Box>
  );
}