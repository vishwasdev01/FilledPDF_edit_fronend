import React, { useState } from "react";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import { API_URL } from "./config";

const App = () => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfBytes, setPdfBytes] = useState(null);
  const [updatedValue, setUpdatedValue] = useState("");

  const fetchPdf = async () => {
    try {
      const response = await axios.get(`${API_URL}/pdf`, {
        responseType: "blob",
        headers: {
          "Content-Type": "application/pdf",
        },
      });
      const pdfBytes = await response.data.arrayBuffer();
      setPdfBytes(pdfBytes);
      const pdfUrl = URL.createObjectURL(response.data);
      setPdfUrl(pdfUrl);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  const handleButtonClick = async (e) => {
    e.preventDefault();

    if (!pdfBytes) return;

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const textField = form.getTextField("name");
    if (textField) {
      textField.setText(updatedValue);
    }
    const modifiedPdfBytes = await pdfDoc.save();
    const formData = new FormData();
    formData.append(
      "pdfFile",
      new Blob([modifiedPdfBytes], { type: "application/pdf" })
    );

    formData.append("updatedValue", updatedValue);
    try {
      const response = await axios.post(
        "http://localhost:3001/pdf/save-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.error("Error saving PDF:", error);
    }
  };

  return (
    <div>
      <button
        onClick={fetchPdf}
        style={{
          background: "#fff",
          color: "#000",
          padding: "10px",
          margin: "10px",
          border: "1px solid #000",
          cursor: "pointer",
          outline: "none",
          borderRadius: "5px",
          fontSize: "16px",
        }}
      >
        Load PDF
      </button>
      <button
        onClick={handleButtonClick}
        style={{
          background: "#fff",
          color: "#000",
          padding: "10px",
          margin: "10px",
          border: "1px solid #000",
          cursor: "pointer",
          outline: "none",
          borderRadius: "5px",
          fontSize: "16px",
        }}
      >
        Save PDF
      </button>
      {pdfUrl && (
        <embed src={pdfUrl} width="100%" height="900px" title="PDF Viewer" />
      )}
    </div>
  );
};

export default App;
