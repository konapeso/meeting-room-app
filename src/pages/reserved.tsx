import { useEffect } from "react";
import { useRouter } from "next/router";

function ReservedPage() {
  const router = useRouter();

  useEffect(() => {
    // 3秒後にホームページにリダイレクト
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    // コンポーネントのアンマウント時にタイマーをクリア
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold text-blue-500 mb-4">予約完了</h1>
        <p className="text-gray-700">会議室の予約が完了しました。</p>
      </div>
    </div>
  );
}

export default ReservedPage;
