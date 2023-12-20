import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    // ユーザーIDを整数に変換
    const userIdInt = parseInt(userId, 10);
    // ログイン処理（FastAPIサーバーとの通信）
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // フィールド名をuser_idに変更
      body: JSON.stringify({ user_id: userIdInt, password }),
    });
    if (response.ok) {
      const { token } = await response.json();
      auth.login(token);
    } else {
      console.error("ログイン失敗");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h1 className="text-lg font-bold mb-4">ログイン</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ユーザーID"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
