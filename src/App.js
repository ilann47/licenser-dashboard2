import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Workspace from "./scenes/workspace";
import Users from "./scenes/users";
import Form from "./scenes/form";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* // Top bar Static Content */}
        <Topbar setIsSidebar={setIsSidebar} />

        <div className="app">
          {/* //Side bar Static Content */}
        <Sidebar isSidebar={isSidebar} />
          <main className="content">
            {/* Main Content */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workspace" element={<Workspace />} />
              <Route path="/users" element={<Users />} />
              <Route path="/form" element={<Form />} />
              <Route path="/license" element={<Form />} />

            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
