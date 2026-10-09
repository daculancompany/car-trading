import type { ComponentType } from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  BanknotesIcon,
  CalendarDaysIcon,
  HomeIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const TABS: { label: string; to: string; icon: ComponentType }[] = [
  { label: "Home", to: "/customer-dashboard", icon: HomeIcon },
  { label: "Cars", to: "/customer-vehicles", icon: TruckIcon },
  { label: "Reservations", to: "/customer-reservations", icon: CalendarDaysIcon },
  { label: "Payments", to: "/customer-payments", icon: BanknotesIcon },
];

export const BOTTOM_NAV_HEIGHT = "64px";

// Phone-style tab bar; "More" opens the full menu drawer.
export default function CustomerBottomNav({ onMore }: { onMore: () => void }) {
  const { pathname } = useLocation();
  const onMainTab = TABS.some((tab) => pathname.startsWith(tab.to));

  const item = (active: boolean) => ({
    flex: 1,
    direction: "column" as const,
    align: "center",
    justify: "center",
    gap: 0.5,
    color: active ? "brand.600" : "gray.500",
    fontWeight: active ? 700 : 500,
    position: "relative" as const,
    _before: active
      ? { content: '""', position: "absolute", top: 0, w: "28px", h: "3px", borderRadius: "full", bg: "brand.600" }
      : undefined,
  });

  return (
    <Flex
      as="nav"
      aria-label="Main"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      h={`calc(${BOTTOM_NAV_HEIGHT} + env(safe-area-inset-bottom))`}
      pb="env(safe-area-inset-bottom)"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      boxShadow="0 -4px 16px rgba(16, 24, 40, 0.06)"
      zIndex={1000}
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.to);
        return (
          <Flex key={tab.to} as={NavLink} to={tab.to} {...item(active)}>
            <Icon as={tab.icon} boxSize={6} />
            <Text fontSize="10px" color="inherit">{tab.label}</Text>
          </Flex>
        );
      })}
      <Flex as="button" type="button" onClick={onMore} {...item(!onMainTab)}>
        <Icon as={Bars3Icon} boxSize={6} />
        <Text fontSize="10px" color="inherit">More</Text>
      </Flex>
    </Flex>
  );
}
