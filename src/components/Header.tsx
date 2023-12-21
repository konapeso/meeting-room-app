// components/Header.js

import Link from "next/link";
import { useAuth } from "../context/AuthContext"; // useAuthフックをインポート

const Header = () => {
  const auth = useAuth(); // AuthコンテキストからuseAuthフックを取得

  const handleLogout = () => {
    // ログアウト処理
    auth.logout();
  };

  return (
    <header className="bg-blue-500 p-4">
      <nav className="flex justify-between items-center">
        <div>
          <Link href="/rooms" className="text-white text-xl font-semibold">
            会議室予約
          </Link>
        </div>
        <div className="flex">
          <div className="pr-5">
            <Link href="/" className="text-white">
              予約一覧
            </Link>
          </div>
          <div>
            {auth.isLoggedIn ? ( // ログイン状態に応じてログアウトボタンを表示
              <button onClick={auth.logout} className="text-white">
                ログアウト
              </button>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
