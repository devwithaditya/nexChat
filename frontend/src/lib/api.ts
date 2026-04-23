const BASE_URL = "http://localhost:5000";
// =========================
// 🔹 Username Suggestion
// =========================
export const suggestUsername = async () => {
  const res = await fetch(`${BASE_URL}/username/suggest`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.msg || "Failed to fetch username");
  }

  return data;
};

// =========================
// 🔹 Register User
// =========================
export const registerUser = async (
  username: string,
  password: string
) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.msg || "Registration failed");
  }

  return data;
};

// =========================
// 🔹 Login User
// =========================
export const loginUser = async (
  username: string,
  password: string
) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.msg || "Login failed");
  }

  return data;
};

// =========================
// 🔹 Search Users
// =========================
export const searchUsers = async (username: string) => {
  const res = await fetch(
    `${BASE_URL}/search?username=${encodeURIComponent(username)}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.msg || "Search failed");
  }

  return data;
};

// =========================
// 🔹 Send Message
// =========================
export const sendMessage = async (data: {
  sender: string;
  receiver: string;
  text: string;
}) => {
  const res = await fetch(`${BASE_URL}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.msg || "Failed to send message");
  }

  return result;
};

// =========================
// 🔹 Get Messages
// =========================
export const getMessages = async (user1: string, user2: string) => {
  const res = await fetch(
    `${BASE_URL}/messages?user1=${encodeURIComponent(
      user1
    )}&user2=${encodeURIComponent(user2)}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.msg || "Failed to fetch messages");
  }

  return data;
};