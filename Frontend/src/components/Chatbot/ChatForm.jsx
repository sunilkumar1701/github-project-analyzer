import { useRef, useEffect } from "react";

const ChatForm = ({ setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();

  // Auto focus when chatbot opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = inputRef.current.value.trim();

    if (!message) return;

    setChatHistory((prev) => [
      ...prev,
      {
        role: "user",
        text: message,
      },
    ]);

    inputRef.current.value = "";

    generateBotResponse(message);

    // Keep focus after send
    inputRef.current.focus();
  };

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Ask anything..."
        className="message-input"
      />

      <button type="submit" className="send-btn">
        ↑
      </button>
    </form>
  );
};

export default ChatForm;