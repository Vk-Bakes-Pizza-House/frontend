import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import QRScanner from "../../context/QrScanner";

function parseTableId(scannedText) {
  try {
    const url = new URL(scannedText);
    return url.searchParams.get("table") || "1";
  } catch {
    return scannedText.replace(/[^a-zA-Z0-9]/g, "") || "1";
  }
}

export default function ScanPage() {
  const navigate = useNavigate();

  const handleScan = useCallback((scannedText) => {
    const id = parseTableId(scannedText);
    navigate(`/menu?table=${encodeURIComponent(id)}`);
  }, [navigate]);

  return <QRScanner onScanSuccess={handleScan} />;
}
