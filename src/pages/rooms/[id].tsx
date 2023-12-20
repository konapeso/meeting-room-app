// src/pages/rooms/[id].tsx
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Select, { ActionMeta, MultiValue } from "react-select";
import { getCurrentUser } from "../../utils/api";

// Roomの型定義
interface Room {
  room_id: number;
  room_name: string;
  capacity: number;
  room_image: string;
  room_type: string;
}

interface Booking {
  booking_id: number;
  user_id: number;
  room_id: number;
  booked_num: number;
  start_datetime: string;
  end_datetime: string;
}

interface User {
  user_id: number;
  user_name: string;
}

// オプションの型を定義
interface OptionType {
  value: number;
  label: string;
}

interface Participant {
  user_id?: number | null;
  is_guest: boolean;
  guest_email?: string | null;
}

function RoomDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<
    OptionType[]
  >([]);
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    if (!router.isReady || !id) return;
    // 会議室の詳細情報を取得
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/rooms/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch room details");
        }
        const data: Room = await response.json();
        setRoom(data);
      } catch (error) {
        console.error(error);
      }
    };
    // 会議室の予約情報を取得
    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/bookings`);
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const bookingsData: Booking[] = await response.json();
        const roomBookings = bookingsData
          .filter((booking) => booking.room_id === Number(id))
          .map((booking) => ({
            ...booking,
            start_datetime: formatDate(booking.start_datetime),
            end_datetime: formatDate(booking.end_datetime),
          }));
        setBookings(roomBookings);
      } catch (error) {
        console.error(error);
      }
    };
    // ユーザーデータの取得
    const fetchUsers = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/users`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData: User[] = await response.json();
        setUsers(usersData);
      } catch (error) {
        console.error(error);
      }
    };
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

    fetchRoomDetails();
    fetchBookings();
    fetchUsers();
  }, [id, router.isReady]);

  const validateBooking = () => {
    // roomがnullでないことを確認
    if (!room) {
      return "部屋の情報がありません。";
    }
    // 定員を超える予約
    if (Number(bookings.length) >= room.capacity) {
      return "定員を超える予約はできません。";
    }

    // 開始時刻 >= 終了時刻のチェック
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (start >= end) {
      return "開始時刻は終了時刻より前でなければなりません。";
    }

    // 利用可能時間外のチェック
    const openingTime = new Date(`${date}T09:00`);
    const closingTime = new Date(`${date}T20:00`);
    if (start < openingTime || end > closingTime) {
      return "利用時間は9:00~20:00です。";
    }

    return "";
  };

  // 参加者の選択肢を作成
  const handleParticipantsChange = (
    selectedOptions: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    setSelectedParticipants(selectedOptions ? [...selectedOptions] : []);
  };

  // ゲストメールアドレス
  const handleGuestEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestEmail(e.target.value);
  };

  // 予約処理
  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateBooking();
    if (error) {
      setErrorMessage(error);
      return;
    }
    // ログインしているユーザーの情報を取得
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      setErrorMessage("ログインユーザーの情報を取得できませんでした");
      return;
    }

    // 予約データを構築
    const bookingData = {
      user_id: currentUser.user_id,
      room_id: Number(id),
      booked_num: selectedParticipants.length,
      start_datetime: new Date(`${date}T${startTime}`).toISOString(),
      end_datetime: new Date(`${date}T${endTime}`).toISOString(),
      participants: selectedParticipants.map((p) => ({
        user_id: p.value,
        is_guest: false,
        guest_email: null,
      })),
    };

    // ゲストルームの場合、ゲストのメールアドレスを参加者リストに追加
    if (room && room.room_type === "ゲストルーム" && guestEmail) {
      bookingData.participants.push({
        user_id: null, // user_id をオプショナルにする
        is_guest: true,
        guest_email: guestEmail,
      });
    }

    // 予約データをサーバーに送信
    try {
      const response = await fetch(`http://127.0.0.1:8000/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("予約に失敗しました");
      }

      // 予約成功処理...
      router.push("/reserved");
    } catch (error) {
      console.error(error);
      setErrorMessage("予約に失敗しました");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 p-4">
        <h1 className="text-2xl font-bold">{room?.room_name}</h1>
        <p>定員: {room?.capacity}</p>
        <p>タイプ: {room?.room_type}</p>
        {/* 画像を表示する場合は以下のコメントを解除 */}
        {/* <img src={room?.room_image} alt={room?.room_name} className="w-full h-auto" /> */}
        <h2 className="text-xl font-bold mt-4">予約状況</h2>
        <ul>
          {bookings.map((booking) => (
            <li key={booking.booking_id}>
              {booking.start_datetime} - {booking.end_datetime}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold">予約</h2>
        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
        <form onSubmit={handleReserve} className="space-y-4">
          <div>
            <label htmlFor="date" className="block">
              日付
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded p-2 text-black"
            />
          </div>
          <div>
            <label htmlFor="startTime" className="block">
              開始時刻
            </label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border rounded p-2 text-black"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block">
              終了時刻
            </label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border rounded p-2 text-black"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="participants" className="block mb-2">
              参加者を選択
            </label>
            <Select
              id="participants"
              isMulti
              options={users.map((user) => ({
                value: user.user_id,
                label: user.user_name,
              }))}
              onChange={handleParticipantsChange}
              className="text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          {room && room.room_type === "ゲストルーム" && (
            <div>
              <label htmlFor="guestEmail" className="block">
                ゲストのメールアドレス
              </label>
              <input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={handleGuestEmailChange}
                className="border rounded p-2  text-black"
              />
            </div>
          )}
          <button type="submit" className="bg-blue-500 text-white rounded p-2">
            予約する
          </button>
        </form>
      </div>
    </div>
  );
}

export default RoomDetailsPage;
