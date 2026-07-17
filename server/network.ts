import os from "node:os";
import qr from "qrcode-terminal";

export function lanIp() {
  for (const list of Object.values(os.networkInterfaces()))
    for (const n of list ?? [])
      if (n.family === "IPv4" && !n.internal) return n.address;
  return "127.0.0.1";
}
export function printLinks(port = 5173) {
  const host = lanIp(),
    walker = `http://${host}:${port}`,
    share = `${walker}/share/sarah-j8xk2`;
  console.log(`\nBeacon walker: ${walker}\nBeacon receiver: ${share}\n`);
  qr.generate(share, { small: true });
}
