// Central API base - change this to the IP/host your DataServer is reachable at from the device
export const API_BASE = "http://192.168.2.63:5050"; // DataServer running on 192.168.2.63:5000

// Utils Server for AI features (chat, translate, pronoun recognition)
export const UTILS_BASE = "http://192.168.2.63:3000"; // Utils Server running on 192.168.2.63:3000

// Notes:
// - When testing on a physical device, set this to your machine IP (where servers run).
// - When testing on emulator, you may need to use emulator loopback (10.0.2.2 for Android emulator).
