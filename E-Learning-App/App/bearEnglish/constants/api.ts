// Central API base - using deployed Render URLs
export const API_BASE = process.env.EXPO_PUBLIC_API_DATA_SERVER || "https://bearenglish-dataserver.onrender.com";

// Utils Server for AI features (chat, translate, pronoun recognition)  
export const UTILS_BASE = process.env.EXPO_PUBLIC_API_UTILS_SERVER || "https://bearenglish-utilserver.onrender.com";

// Debug logging
console.log("🚀 API Configuration:");
console.log("📊 DATA SERVER:", API_BASE);
console.log("🛠️ UTILS SERVER:", UTILS_BASE);

// Notes:
// - When testing on a physical device, set this to your machine IP (where servers run).
// - When testing on emulator, you may need to use emulator loopback (10.0.2.2 for Android emulator).
