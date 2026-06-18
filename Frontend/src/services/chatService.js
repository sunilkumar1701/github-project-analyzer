import axios from "axios";

const API_URL = "http://localhost:5000/api/chat";

export const sendChatMessage = async ({
  username,
  message,
  dashboardContext,
}) => {
  const response = await axios.post(
    API_URL,
    {
      username,
      message,
      dashboardContext,
    }
  );

  return response.data;
};