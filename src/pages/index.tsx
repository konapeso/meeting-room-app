// src/pages/reservations.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getUsers,
  getRooms,
  cancelBooking,
  getBookings,
  getParticipants,
} from "../utils/api";

interface User {
  user_name: string;
  user_id: number;
  // 他のユーザー情報があれば追加
}

interface Room {
  room_name: string;
  room_id: number;
  // 他の部屋情報があれば追加
}

interface Participant {
  user_id: number;
  is_guest: boolean;
  guest_email: string | null;
  participant_id: number;
}

interface Booking {
  booking_id: number;
  user_id: number;
  room_id: number;
  start_datetime: string;
  end_datetime: string;
  user?: User;
  room?: Room;
  participants?: Participant[];
}

function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const [bookingsData, usersData, roomsData] = await Promise.all([
          getBookings(),
          getUsers(),
          getRooms(),
        ]);

        const bookingsWithParticipants = await Promise.all(
          bookingsData.map(async (booking: Booking) => {
            const participants = await getParticipants(booking.booking_id);
            const participantsNames = participants.map(
              (participant: Participant) => {
                const user = usersData.find(
                  (user: User) => user.user_id === participant.user_id
                );
                return user ? user.user_name : "ゲスト";
              }
            );

            return {
              ...booking,
              user: usersData.find(
                (user: User) => user.user_id === booking.user_id
              ),
              room: roomsData.find(
                (room: Room) => room.room_id === booking.room_id
              ),
              participants: participantsNames,
            };
          })
        );

        setBookings(bookingsWithParticipants);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBookings();
  }, []);

  // 日時をフォーマットするヘルパー関数
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelBooking = async (
    bookingId: number,
    startDatetime: string
  ) => {
    const now = new Date();
    const startTime = new Date(startDatetime);

    // 予約開始時間が現在時刻より30分以上先であることを確認
    if (startTime.getTime() - now.getTime() < 30 * 60 * 1000) {
      alert("予約開始の30分前にはキャンセルできません。");
      return;
    }

    try {
      const success = await cancelBooking(bookingId); // 予約をキャンセルするAPI呼び出し
      if (!success) {
        throw new Error("Failed to cancel reservation");
      }
      // キャンセル成功時の処理
      router.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">予約一覧</h1>
      <ul>
        {bookings.map((booking) => {
          const now = new Date();
          const endDateTime = new Date(booking.end_datetime);
          const isPastBooking = now > endDateTime;

          return (
            <li
              key={booking.booking_id}
              className="border-b border-gray-300 py-2"
            >
              <p>予約ID: {booking.booking_id}</p>
              <p>予約者: {booking.user?.user_name || "不明"}</p>
              <p>部屋名: {booking.room?.room_name || "不明"}</p>
              <p className="text-black">
                開始時刻: {formatDate(booking.start_datetime)}
              </p>
              <p className="text-black">
                終了時刻: {formatDate(booking.end_datetime)}
              </p>
              <p>参加者: {booking.participants?.join(", ") || "なし"}</p>
              <button
                onClick={() =>
                  handleCancelBooking(
                    booking.booking_id,
                    booking.start_datetime
                  )
                }
                className={`text-white font-bold py-2 px-4 rounded ${
                  isPastBooking
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } mt-2`}
              >
                {isPastBooking ? "削除" : "キャンセル"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default BookingsPage;
