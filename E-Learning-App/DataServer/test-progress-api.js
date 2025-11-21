/**
 * Test script for Progress API
 * Run: node test-progress-api.js
 */

const API_BASE = "http://192.168.1.12:5000"; // Thay bằng IP của bạn

// Test userId - thay bằng user ID thực tế từ database
const TEST_USER_ID = "6745e5f9eb7cf94b8c0f84aa"; // Thay bằng ID user thực
const TEST_LESSON_ID = "674dd5a85867f17890a7a95c"; // Thay bằng ID lesson thực

async function testCompleteLesson() {
  console.log("\n=== Testing Complete Lesson API ===");
  console.log(`POST ${API_BASE}/api/progress/${TEST_USER_ID}/complete-lesson`);

  try {
    const response = await fetch(
      `${API_BASE}/api/progress/${TEST_USER_ID}/complete-lesson`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: TEST_LESSON_ID,
          category: "reading",
        }),
      }
    );

    const data = await response.json();
    console.log("\nResponse Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✅ Lesson completed successfully!");
      console.log("📊 Streak:", data.data.streak);
      console.log("📅 Last Study Date:", data.data.lastStudyDate);
      console.log("📚 Reading Progress:", data.data.reading);
    } else {
      console.log("\n❌ Failed:", data.message);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

async function testGetProgress() {
  console.log("\n=== Testing Get Progress API ===");
  console.log(`GET ${API_BASE}/api/progress/${TEST_USER_ID}`);

  try {
    const response = await fetch(`${API_BASE}/api/progress/${TEST_USER_ID}`);

    const data = await response.json();
    console.log("\nResponse Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✅ Progress retrieved successfully!");
      console.log("📊 Streak:", data.data.streak);
      console.log("📅 Last Study Date:", data.data.lastStudyDate);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

async function testGetStats() {
  console.log("\n=== Testing Get Stats API ===");
  console.log(`GET ${API_BASE}/api/progress/${TEST_USER_ID}/stats`);

  try {
    const response = await fetch(
      `${API_BASE}/api/progress/${TEST_USER_ID}/stats`
    );

    const data = await response.json();
    console.log("\nResponse Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✅ Stats retrieved successfully!");
      console.log("📊 Total Completed:", data.data.totalCompleted);
      console.log("🔥 Streak:", data.data.streak);
      console.log("📖 Words Learned:", data.data.wordsLearned);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting Progress API Tests...\n");
  console.log(
    "Note: Update TEST_USER_ID and TEST_LESSON_ID with real values from your database\n"
  );

  await testGetProgress();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testGetStats();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testCompleteLesson();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check again after completing
  await testGetStats();

  console.log("\n✅ All tests completed!");
}

runTests();
