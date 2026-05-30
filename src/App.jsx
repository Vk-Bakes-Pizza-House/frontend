// App.jsx

// App entry
import {
  BrowserRouter as Router,
} from "react-router-dom";

import { Toaster } from "sonner";

import LayoutWrapper from "./layout/LayoutWrapper";



// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────

export default function App() {
  return (
    <Router>

      <LayoutWrapper />

      {/* Global Toast */}
      <Toaster
        position="top-right"
        richColors
      />

    </Router>
  );
}