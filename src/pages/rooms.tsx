// src/pages/rooms.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
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
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.push("/login");
    }
    const fetchRooms = async () => {
      const response = await fetch("http://localhost:8000/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    };

    fetchRooms();
  }, [auth.isLoggedIn, router]);

  return (
    <div className="flex flex-col p-10 mx-auto bg-gray-100">
      <h1 className="text-2xl font-bold text-center mb-6 text-black">
        会議室一覧
      </h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <li
            key={room.room_id}
            className="border rounded shadow p-4 hover:shadow-lg bg-white"
          >
            <Link href={`/rooms/${room.room_id}`}>
              <h2 className="text-xl font-semibold mb-2 text-black">
                {room.room_name}
              </h2>
              <p className="mb-1 text-black">定員: {room.capacity}</p>
              <p className="mb-1 text-black">タイプ: {room.room_type}</p>
              <Image
                src={`${room.room_image}`}
                alt={`会議室 ${room.room_name}`}
                className="w-full h-auto object-cover"
                width={640}
                height={427}
                layout="responsive"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomsPage;
