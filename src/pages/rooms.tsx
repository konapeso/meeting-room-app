import Link from "next/link";

function RoomsPage() {
  // 会議室データの取得（ダミーデータ）
  const rooms = [
    { id: 1, name: "会議室A" },
    { id: 2, name: "会議室B" },
    // 他の会議室...
  ];

  return (
    <div>
      <h1>会議室一覧</h1>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <Link href={`/rooms/${room.id}`}>
              <a>{room.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoomsPage;
