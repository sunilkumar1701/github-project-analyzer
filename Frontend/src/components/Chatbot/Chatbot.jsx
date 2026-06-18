import "./Chatbot.css";

import { useState } from "react";

import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

import { sendChatMessage } from "../../services/chatService";
import { useDashboardContext } from "../../context/DashboardContext";

const Chatbot = ({ onClose, username }) => {
  const { dashboardData } = useDashboardContext();

  const [chatHistory, setChatHistory] = useState([
    {
      role: "model",
      text: "👋 Hi! I am your GitHub AI Assistant.\n\nAsk me anything about this profile.",
    },
  ]);

  const generateBotResponse = async (message) => {
    try {
      console.log("\n========== CHATBOT DASHBOARD DATA ==========\n");

      console.dir(dashboardData, {
        depth: null,
      });

      console.log("\n===========================================\n");

      setChatHistory((prev) => [
        ...prev,
        {
          role: "model",
          text: "Thinking...",
        },
      ]);
      console.log(JSON.stringify(dashboardData, null, 2));
      const response = await sendChatMessage({
        username,
        message,
        dashboardContext: dashboardData,
      });

      setChatHistory((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "model",
          text: response.answer,
        };

        return updated;
      });
    } catch (error) {
      console.error(error);

      setChatHistory((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "model",
          text: "❌ Failed to get response from AI.",
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
