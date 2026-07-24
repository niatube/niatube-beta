import {
  Room,
  RoomEvent,
  LocalParticipant,
} from "livekit-client";

export type ConnectToLiveKitOptions = {
  roomName: string;
  participantName: string;
  role: "creator" | "viewer";
};

export async function connectToLiveKit({
  roomName,
  participantName,
  role,
}: ConnectToLiveKitOptions) {
  const response = await fetch("/api/livekit/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roomName,
      participantName,
      role,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to obtain LiveKit access token.");
  }

  const { token, serverUrl } = await response.json();

  const room = new Room();

  await room.connect(serverUrl, token);

  if (role === "creator") {
    await room.localParticipant.enableCameraAndMicrophone();
  }

  room.on(RoomEvent.Disconnected, () => {
    console.log("Disconnected from LiveKit.");
  });

  return room;
}

export async function disconnectFromLiveKit(room: Room | null) {
  if (!room) {
    return;
  }

  room.disconnect();
}