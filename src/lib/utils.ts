const CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode() {
  const buffer = new Uint32Array(6);
  window.crypto.getRandomValues(buffer);

  return Array.from(buffer)
    .map((value) => CODE_CHARSET[value % CODE_CHARSET.length])
    .join("");
}

export function shortClientId(clientId: string) {
  return clientId.slice(0, 4).toUpperCase();
}

export function createMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
