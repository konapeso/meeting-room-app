// src/pages/rooms.tsx
import { useState, useEffect } from "react";
// import Image from "next/image";
import Link from "next/link";

interface Room {
  room_id: number;
  room_name: string;
  capacity: number;
  room_image: string;
  room_type: string;
}

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const response = await fetch("http://localhost:8000/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="p-10 mx-auto h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-center mb-6">会議室一覧</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <li
            key={room.room_id}
            className="border rounded shadow p-4 hover:shadow-lg bg-white"
          >
            <Link href={`/rooms/${room.room_id}`}>
              <h2 className="text-xl font-semibold mb-2">{room.room_name}</h2>
              <p className="mb-1">定員: {room.capacity}</p>
              <p className="mb-1">タイプ: {room.room_type}</p>
              {/* 画像の表示が必要な場合は以下のコメントを解除 */}
              {/* <img
                  src={`/images/${room.room_image}`}
                  alt={`会議室 ${room.room_name}`}
                  className="w-full h-auto object-cover"
                /> */}
              {/* <p>{room.room_image}</p> */}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomsPage;
