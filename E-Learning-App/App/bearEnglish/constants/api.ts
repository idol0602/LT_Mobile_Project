// Central API base - using deployed Render URLs
export const API_BASE = "http://192.168.1.5:5050"; // DataServer running on 192.168.1.52:5050

// Utils Server for AI features (chat, translate, pronoun recognition)
export const UTILS_BASE = "http://192.168.1.5:3000";
// Debug logging
console.log("🚀 API Configuration:");
console.log("📊 DATA SERVER:", API_BASE);
console.log("🛠️ UTILS SERVER:", UTILS_BASE);

// Notes:
// - When testing on a physical device, set this to your machine IP (where servers run).
// - When testing on emulator, you may need to use emulator loopback (10.0.2.2 for Android emulator).
