// QRScanner.jsx
// Install dependency first: npm install html5-qrcode

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    scanner
      .start(
        { facingMode: "environment" }, // use back camera
        config,
        (decodedText) => {
          // Called when QR is scanned successfully
          scanner.stop().then(() => {
            onScanSuccess(decodedText);
          });
        },
        () => {} // ignore scan errors (frame-by-frame misses)
      )
      .then(() => setIsStarting(false))
      .catch((err) => {
        setError("Camera access denied. Please allow camera permission.");
        console.error("QR Scanner error:", err);
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScanSuccess]);

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Scan QR Code</h2>
      <p style={styles.subtitle}>Point your camera at the table QR code</p>

      <div style={styles.scanBox}>
        {isStarting && !error && (
          <div style={styles.loading}>Starting camera...</div>
        )}
        <div id="qr-reader" style={styles.reader} />
        {/* Corner decorations */}
        <div style={{ ...styles.corner, top: 0, left: 0, borderWidth: "3px 0 0 3px" }} />
        <div style={{ ...styles.corner, top: 0, right: 0, borderWidth: "3px 3px 0 0" }} />
        <div style={{ ...styles.corner, bottom: 0, left: 0, borderWidth: "0 0 3px 3px" }} />
        <div style={{ ...styles.corner, bottom: 0, right: 0, borderWidth: "0 3px 3px 0" }} />
      </div>

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1rem",
    minHeight: "100vh",
    background: "#0f0f0f",
  },
  title: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: 500,
    marginBottom: "6px",
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "14px",
    marginBottom: "2rem",
  },
  scanBox: {
    position: "relative",
    width: "300px",
    height: "300px",
  },
  reader: {
    width: "300px",
    height: "300px",
    overflow: "hidden",
    borderRadius: "12px",
  },
  corner: {
    position: "absolute",
    width: "24px",
    height: "24px",
    borderStyle: "solid",
    borderColor: "#fff",
    borderRadius: "2px",
  },
  loading: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    zIndex: 1,
  },
  error: {
    color: "#f87171",
    fontSize: "14px",
    marginTop: "1.5rem",
    textAlign: "center",
    maxWidth: "280px",
  },
};