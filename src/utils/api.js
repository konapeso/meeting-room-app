// utils/api.js
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
