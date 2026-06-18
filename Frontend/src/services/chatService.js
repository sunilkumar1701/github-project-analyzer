import apiClient from "./apiClient";

export const sendChatMessage = async ({
  username,
  message,
  dashboardContext,
}) => {
  try {
    const response = await apiClient.post(
      "/chat",
      {
        username,
        message,
        dashboardContext,
      },
    );

    return response.data;
  } catch (error) {
    throw {
      status: error.status,

      message:
        error.message ||
        "Unable to connect to AI server.",
    };
  }
};