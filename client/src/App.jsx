import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import Navbar from "./components/Navbar";
import { Box } from "@mui/material";

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <AppRouter />
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;