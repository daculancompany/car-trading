// One table look for the whole app: light header, thin row lines, no cell gaps.
// Borders live only in the variant, with borderBottom before borderColor:
// a later border shorthand would reset the color to the text color.
const Table = {
  baseStyle: {
    table: {
      borderCollapse: "collapse",
    },

    th: {
      bg: "gray.50",
      color: "gray.600",
      fontSize: "xs",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      py: 3,
    },

    td: {
      py: 3,
    },
  },

  variants: {
    simple: {
      th: { borderBottom: "1px solid", borderColor: "gray.200" },
      td: { borderBottom: "1px solid", borderColor: "gray.100" },
    },
  },
};

export default Table;
