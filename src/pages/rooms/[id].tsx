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
  is_executive: boolean;
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
        timeZone: "Asia/Tokyo",
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

  // 役員用の部屋の場合、is_executive が true のユーザーのみをフィルタリング
  const executiveUsers = users.filter((user) => {
    return room?.room_type !== "役員用" || user.is_executive === true;
  });

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
      setErrorMessage("ログインしなおしてください。");
      return;
    }

    // 定員チェック
    const totalParticipants =
      selectedParticipants.length + (guestEmail ? 1 : 0); // ゲストメールがあれば参加者に含める
    if (room && totalParticipants > room.capacity) {
      setErrorMessage("定員を超える予約はできません。");
      return;
    }

    // 役員用の部屋かつ is_executive が false の場合は予約を許可しない
    if (room?.room_type === "役員用" && currentUser.is_executive === false) {
      setErrorMessage("役員用の部屋は予約できません。");
      return;
    }

    // 予約データを構築
    const bookingData = {
      user_id: currentUser.user_id,
      room_id: Number(id),
      booked_num: selectedParticipants.length,
      start_datetime: `${date}T${startTime}`,
      end_datetime: `${date}T${endTime}`,
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
        // 404エラーを特定してエラーメッセージを表示
        if (response.status === 404) {
          setErrorMessage("指定の時間にはすでに予約が入っています。");
        } else {
          setErrorMessage("予約に失敗しました");
        }
        return;
      }

      // 予約成功処理...
      router.push("/reserved");
    } catch (error) {
      console.error(error);
      setErrorMessage("予約に失敗しました");
    }
  };

  return (
    <div className="flex flex-wrap h-screen bg-gray-100">
      <div className="w-full lg:w-1/2 p-4">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h1 className="text-2xl font-bold mb-2 text-black">
            {room?.room_name}
          </h1>
          <p className="mb-4 text-black">定員: {room?.capacity}</p>
          <p className="mb-4 text-black">タイプ: {room?.room_type}</p>
          <h2 className="text-xl font-bold mt-4 mb-4 text-black">予約状況</h2>
          <div className="overflow-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 border-b border-gray-200 text-black">
                    予約時間
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td className="py-2 border-b border-gray-200 text-black">
                      {booking.start_datetime} - {booking.end_datetime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="w-1/2 px-10 py-4">
        <h2 className="text-xl font-bold text-black">予約</h2>
        <form onSubmit={handleReserve} className="space-y-4">
          {/* 入力フィールドの共通スタイルを適用 */}
          <div>
            <label htmlFor="date" className="block text-black">
              日付
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded p-2 w-full text-black"
            />
          </div>
          <div>
            <label htmlFor="startTime" className="block text-black">
              開始時刻
            </label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border rounded p-2 w-full text-black"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-black">
              終了時刻
            </label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border rounded p-2 w-full text-black"
            />
          </div>
          {/* 参加者選択とゲストメールアドレス入力フィールドのスタイルを統一 */}
          <div className="mb-4">
            <label htmlFor="participants" className="block mb-2 text-black">
              参加者を選択
            </label>
            <Select
              id="participants"
              isMulti
              options={executiveUsers.map((user) => ({
                value: user.user_id,
                label: user.user_name,
              }))}
              onChange={handleParticipantsChange}
              className="text-base w-full text-black border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          {room && room.room_type === "ゲストルーム" && (
            <div>
              <label htmlFor="guestEmail" className="block text-black">
                ゲストのメールアドレス
              </label>
              <input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={handleGuestEmailChange}
                className="border rounded p-2 w-full text-black"
              />
            </div>
          )}
          {errorMessage && <div className="text-red-500">{errorMessage}</div>}
          <button type="submit" className="bg-blue-500 text-white rounded p-2">
            予約する
          </button>
        </form>
      </div>
    </div>
  );
}

export default RoomDetailsPage;
