# Achievement System API Documentation

## 📋 Tổng quan

Hệ thống Achievement (Thành tựu) cho phép:

- Quản lý achievements (tạo, sửa, xóa)
- Theo dõi achievements của từng user
- Tự động unlock achievements khi đạt điều kiện
- Thống kê tiến độ hoàn thành

## 🗂️ Models

### Achievement Model

```javascript
{
  name: String,              // Tên achievement
  code: String,              // Mã unique (FIRST_STEP, WEEK_WARRIOR)
  description: String,       // Mô tả
  type: String,             // progress, vocab, streak, global, first
  condition: {
    minLessonsCompleted: Number,  // Số bài học tối thiểu
    minWordsLearned: Number,      // Số từ vựng tối thiểu
    minStreak: Number,            // Streak tối thiểu
    category: String              // reading, vocab, listening, grammar
  },
  difficulty: String,       // easy, normal, hard
  icon: String,            // Emoji hoặc URL icon
  hidden: Boolean          // Ẩn cho đến khi unlock
}
```

### UserAchievement Model

```javascript
{
  userId: ObjectId,         // Ref to User
  achievementId: ObjectId,  // Ref to Achievement
  unlockedAt: Date,        // Thời điểm unlock
  notified: Boolean,       // Đã thông báo chưa
  progress: Number,        // % hoàn thành (0-100)
  completed: Boolean       // Đã hoàn thành chưa
}
```

## 🛣️ API Endpoints

### 1. Achievement Management (Admin)

#### GET /api/achievements

Lấy tất cả achievements

```javascript
Query: ?includeHidden=true

Response: {
  success: true,
  data: [Achievement],
  count: Number
}
```

#### GET /api/achievements/:id

Lấy chi tiết một achievement

```javascript
Response: {
  success: true,
  data: Achievement
}
```

#### POST /api/achievements

Tạo achievement mới (Admin only)

```javascript
Body: {
  name: "First Step",
  code: "FIRST_STEP",
  description: "Complete your first lesson",
  type: "first",
  condition: { minLessonsCompleted: 1 },
  difficulty: "easy",
  icon: "🎯"
}

Response: {
  success: true,
  message: "Achievement created successfully",
  data: Achievement
}
```

#### PUT /api/achievements/:id

Cập nhật achievement

```javascript
Body: { name: "Updated name", ... }

Response: {
  success: true,
  message: "Achievement updated successfully",
  data: Achievement
}
```

#### DELETE /api/achievements/:id

Xóa achievement

```javascript
Response: {
  success: true,
  message: "Achievement deleted successfully"
}
```

### 2. User Achievement Tracking

#### GET /api/achievements/user/:userId

Lấy tất cả achievements của user (cả unlocked và locked)

```javascript
Response: {
  success: true,
  data: [
    {
      ...Achievement,
      unlocked: Boolean,
      unlockedAt: Date,
      progress: Number,
      completed: Boolean
    }
  ],
  totalAchievements: Number,
  unlockedCount: Number
}
```

#### GET /api/achievements/user/:userId/stats

Lấy thống kê achievements

```javascript
Response: {
  success: true,
  data: {
    totalAchievements: Number,
    unlockedAchievements: Number,
    completionRate: Number,
    recentUnlocked: [UserAchievement]
  }
}
```

#### POST /api/achievements/user/:userId/unlock/:achievementId

Unlock achievement cho user (Manual)

```javascript
Body: {
  progress: 100,
  completed: true
}

Response: {
  success: true,
  message: "Achievement unlocked successfully",
  data: UserAchievement
}
```

#### POST /api/achievements/user/:userId/check

🔥 **Tự động kiểm tra và unlock achievements đủ điều kiện**

```javascript
Response: {
  success: true,
  message: "Checked achievements, X newly unlocked",
  data: [Achievement],  // Achievements mới unlock
  count: Number
}
```

#### PUT /api/achievements/user/:userId/notify/:achievementId

Đánh dấu achievement đã được thông báo

```javascript
Response: {
  success: true,
  message: "Achievement marked as notified",
  data: UserAchievement
}
```

## 🎯 Cách sử dụng

### 1. Setup ban đầu

#### Tạo sample achievements:

```bash
cd DataServer
node scripts/seedAchievements.js
```

### 2. Kiểm tra achievements tự động

Gọi API này sau mỗi lần user hoàn thành bài học:

```javascript
POST / api / achievements / user / { userId } / check;
```

Hệ thống sẽ:

- Lấy progress của user
- So sánh với điều kiện của các achievements
- Tự động unlock nếu đủ điều kiện
- Trả về danh sách achievements mới unlock

### 3. Hiển thị achievements trong app

```javascript
// Lấy tất cả achievements với trạng thái
GET /api/achievements/user/{userId}

// Kết quả:
[
  {
    name: "First Step",
    unlocked: true,
    unlockedAt: "2025-11-20T...",
    ...
  },
  {
    name: "Week Warrior",
    unlocked: false,
    progress: 0,
    ...
  }
]
```

### 4. Hiển thị thống kê

```javascript
GET /api/achievements/user/{userId}/stats

// Kết quả:
{
  totalAchievements: 10,
  unlockedAchievements: 3,
  completionRate: 30,
  recentUnlocked: [...]
}
```

## 📊 Logic kiểm tra điều kiện

Hệ thống tự động kiểm tra:

1. **Streak**: `userProgress.streak >= condition.minStreak`
2. **Total Lessons**: Tổng bài (reading + vocab + listening + grammar)
3. **Words Learned**: `userProgress.vocab.wordsLearned >= condition.minWordsLearned`
4. **Category-specific**: Số bài trong category cụ thể

## 🧪 Testing

```bash
# Test các API endpoints
node test-achievement-api.js
```

## 💡 Sample Achievements

1. **First Step** 🎯 - Complete 1 lesson
2. **Week Warrior** 🔥 - 7-day streak
3. **Month Master** 👑 - 30-day streak
4. **Vocabulary Novice** 📚 - Learn 50 words
5. **Vocabulary Expert** 🎓 - Learn 500 words
6. **Reading Beginner** 📖 - 5 reading lessons
7. **Listening Pro** 🎧 - 10 listening lessons
8. **Perfect Streak** 💯 - 100-day streak
9. **Speed Demon** ⚡ - 50 total lessons
10. **Grammar Guru** ✍️ - 10 grammar lessons

## 🔄 Integration Flow

```
User completes lesson
     ↓
API.completeLesson() updates UserProgress
     ↓
Call API.checkAchievements(userId)
     ↓
System checks all achievements
     ↓
Auto-unlock qualifying achievements
     ↓
Return newly unlocked achievements
     ↓
Show notification to user
```

## 📝 Notes

- Mỗi achievement chỉ unlock 1 lần (unique index: userId + achievementId)
- Hidden achievements chỉ hiện khi user unlock
- Có thể dùng `notified` flag để track popup đã hiển thị
- Difficulty: easy/normal/hard để sort và UI styling
