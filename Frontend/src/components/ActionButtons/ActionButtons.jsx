import "./ActionButtons.css";

import { RefreshCw, Download } from "lucide-react";
import chatbotIcon from "../../assets/Chatbot.png";

import { useState } from "react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import Chatbot from "../Chatbot/Chatbot";

const ActionButtons = ({
  isLoading,
  dashboardRef,
  onReanalyze,
  username,
  dashboardData,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const [showChatbot, setShowChatbot] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const dashboard = dashboardRef?.current;

      if (!dashboard) return;

      const originalWidth = dashboard.style.width;

      dashboard.style.width = "720px";

      const canvas = await html2canvas(dashboard, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#08111f",
        width: 720,
        windowWidth: 720,
      });

      dashboard.style.width = originalWidth;

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();

      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 8;

      const usableWidth = pdfWidth - margin * 2;

      pdf.setFont("helvetica", "bold");

      pdf.setFontSize(20);

      pdf.setTextColor(99, 102, 241);

      pdf.text("GitHub Analyzer Report", pdfWidth / 2, 18, {
        align: "center",
      });

      pdf.setFont("helvetica", "normal");

      pdf.setFontSize(10);

      pdf.setTextColor(120, 120, 120);

      pdf.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        pdfWidth / 2,
        25,
        {
          align: "center",
        },
      );

      const topOffset = 35;

      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imgHeight;

      let position = topOffset;

      pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);

      heightLeft -= pdfHeight - topOffset;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;

        pdf.addPage();

        pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);

        heightLeft -= pdfHeight;
      }

      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        pdf.setFontSize(8);

        pdf.setTextColor(140, 140, 140);

        pdf.text(`Page ${i} of ${totalPages}`, pdfWidth / 2, pdfHeight - 5, {
          align: "center",
        });
      }

      pdf.save("github-analysis.pdf");
    } catch (error) {
      console.error("PDF Download Error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleChatbot = () => {
    setShowChatbot((prev) => !prev);
  };

  return (
    <>
      <div
        className={`action-buttons-card ${isLoading ? "buttons-disabled" : ""}`}
      >
        <button
          className="reanalyze-btn"
          disabled={isLoading}
          onClick={onReanalyze}
        >
          <RefreshCw size={18} className={isLoading ? "spin-icon" : ""} />

          <span>
            {isLoading
              ? "Fetching Latest Insights..."
              : "Analyze This Profile Again"}
          </span>
        </button>

        <button
          className="icon-btn"
          disabled={isLoading || isDownloading}
          onClick={handleDownload}
          title="Download Report"
        >
          <Download size={20} className={isDownloading ? "spin-icon" : ""} />
        </button>

        <button
          className="icon-btn chatbot-btn"
          disabled={isLoading}
          onClick={handleChatbot}
          title="GitHub AI Assistant"
        >
          <img src={chatbotIcon} alt="AI Assistant" className="chatbot-image" />

          <span>AI</span>
        </button>
      </div>

      {showChatbot && (
        <Chatbot
          onClose={() => setShowChatbot(false)}
          username={username}
          dashboardContext={dashboardData}
        />
      )}
    </>
  );
};

export default ActionButtons;
