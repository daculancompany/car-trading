import { extendTheme } from "@chakra-ui/react";

import colors from "./colors";
import typography from "./typography";
import radii from "./radii";

import Button from "./components/Button";
import Input from "./components/Input";
import Card from "./components/Card";
import Heading from "./components/Heading";
import Text from "./components/Text";
import FormLabel from "./components/FormLabel";
import Select from "./components/Select";
import Table from "./components/Table";
import Badge from "./components/Badge";

const theme = extendTheme({
  colors,

  fonts: typography.fonts,

  radii,

  // Every card-like section (page header, toolbar, table) uses layerStyle="panel".
  layerStyles: {
    panel: {
      bg: "white",
      border: "1px solid",
      borderColor: "gray.200",
      borderRadius: "lg",
      boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
    },
  },

  styles: {
    global: {
      body: {
        bg: "gray.50", // #F8F9FA
        color: "dark.900",
      },
    },
  },

  components: {
    Button,
    Input,
    Card,
    Heading,
    Text,
    FormLabel,
    Select,
    Table,
    Badge,
  },
});

export default theme;
