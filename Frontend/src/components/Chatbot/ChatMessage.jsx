import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatMessage = ({ chat }) => {
  return (
    <div
      className={`message ${
        chat.role === "model"
          ? "bot-message"
          : "user-message"
      }`}
    >
      <div className="message-text">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {chat.text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ChatMessage;