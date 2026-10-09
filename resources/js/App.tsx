import { ChakraProvider } from "@chakra-ui/react";
import AppRoutes from "./routes";
import theme from "./theme/index";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AppRoutes />
    </ChakraProvider>
  );
}

export default App;
