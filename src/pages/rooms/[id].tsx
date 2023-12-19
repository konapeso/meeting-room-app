import { useRouter } from "next/router";
import { useState } from "react";

function RoomDetailsPage() {
  const router = useRouter();
  const { id } = router.query; // URLから会議室IDを取得

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleReserve = () => {
    // 予約処理
    router.push("/reservation-complete");
  };

  return (
    <div>
      <h1>会議室 {id}</h1>
      <form onSubmit={handleReserve}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <button type="submit">予約</button>
      </form>
    </div>
  );
}

export default RoomDetailsPage;
