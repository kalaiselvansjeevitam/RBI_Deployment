import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { ROUTE_URL } from "../../../app/core/constants/coreUrl";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export const PDF = () => {
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState(0);

  const goToDashboard = () => {
    navigate(ROUTE_URL.vleDashboard);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* Close Button */}
      <button
        onClick={goToDashboard}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          border: "none",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        <X size={22} />
      </button>

      <Document
        file="/rbi-deployment/admin/files/test.pdf"
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(error) => console.error(error)}
      >
        {Array.from({ length: numPages }, (_, index) => (
          <Page key={index} pageNumber={index + 1} width={900} />
        ))}
      </Document>

      {/* Continue Button */}
      <button
        onClick={goToDashboard}
        style={{
          margin: "24px 0",
          padding: "12px 32px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)",
        }}
      >
        Continue to Dashboard
      </button>
    </div>
  );
};
