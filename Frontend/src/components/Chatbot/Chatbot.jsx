import "./Chatbot.css";

import { useState, useRef, useEffect } from "react";

import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

import { sendChatMessage } from "../../services/chatService";
import { useDashboardContext } from "../../context/DashboardContext";

const Chatbot = ({ onClose, username }) => {
  const { dashboardData } = useDashboardContext();

  const bottomRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([
    {
      role: "model",
      text: "👋 Hi! I am your GitHub AI Assistant.\n\nAsk me anything about this profile.",
    },
  ]);

  // Auto scroll whenever chat changes
  useEffect(() => {
  requestAnimationFrame(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  });
}, [chatHistory]);

  const generateBotResponse = async (message) => {
    try {
      console.log("\n========== CHATBOT DASHBOARD DATA ==========\n");

      console.dir(dashboardData, {
        depth: null,
      });

      console.log("\n===========================================\n");

      // Add Thinking...
      setChatHistory((prev) => [
        ...prev,
        {
          role: "model",
          text: "Thinking...",
        },
      ]);

      const response = await sendChatMessage({
        username,
        message,
        dashboardContext: dashboardData,
      });

      // Typewriter effect
      const fullText = response.answer;

      let currentText = "";

      for (let i = 0; i < fullText.length; i++) {
        currentText += fullText[i];

        setChatHistory((prev) => {
          const updated = [...prev];

          updated[updated.length - 1] = {
            role: "model",
            text: currentText,
          };

          return updated;
        });

        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.error(error);

      const errorMessage =
        error.response?.data?.answer ||
        error.response?.data?.message ||
        error.message ||
        "Failed to get response from AI.";

      setChatHistory((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "model",
          text: `❌ ${errorMessage}`,
        };

        return updated;
      });
    }
  };

  return (
    <div className="chatbot-popup">
      <div className="chat-header">
        <h3>GitHub AI Assistant</h3>

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="chat-body">
        {chatHistory.map((chat, index) => (
          <ChatMessage key={index} chat={chat} />
        ))}

        <div ref={bottomRef}></div>
      </div>

      <div className="chat-footer">
        <ChatForm
          setChatHistory={setChatHistory}
          generateBotResponse={generateBotResponse}
        />
      </div>
    </div>
  );
};

export default Chatbot;