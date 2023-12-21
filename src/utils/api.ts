// utils/api.ts
const API_BASE_URL = "http://127.0.0.1:8000";

export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await fetch("http://127.0.0.1:8000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("User data fetch failed");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch users", error);
    throw error;
  }
};

export const getRooms = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    if (!response.ok) {
      throw new Error("Failed to fetch rooms");
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch rooms", error);
    throw error;
  }
};

export const getBookings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch bookings", error);
    throw error;
  }
};

export const getParticipants = async (bookingId: number) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/bookings/${bookingId}/participants`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch participants for booking ${bookingId}`);
    }
    return response.json();
  } catch (error) {
    console.error(
      `Failed to fetch participants for booking ${bookingId}`,
      error
    );
    throw error;
  }
};

export const cancelBooking = async (bookingId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to cancel booking ${bookingId}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to cancel booking ${bookingId}`, error);
    return false;
  }
};
