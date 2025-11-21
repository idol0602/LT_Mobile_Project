# Achievement System Documentation

## Overview

The achievement system tracks user progress and awards achievements based on completed lessons, streak days, words learned, and other milestones.

## Architecture

### Backend (DataServer)

- **Model**: `Achievement` and `UserAchievement` schemas in MongoDB
- **Controller**: `achievementController.js` with CRUD operations and auto-unlock logic
- **Routes**: `/api/achievements` endpoints

### Frontend (Mobile App)

- **Hook**: `useAchievements` - Custom hook for managing achievements
- **Component**: `AchievementUnlockModal` - Modal to display unlocked achievements
- **API**: Achievement methods in `api/index.ts`

## Achievement Types

- `first` - First-time achievements (e.g., First Step)
- `progress` - Progress-based achievements (e.g., Complete 10 lessons)
- `vocab` - Vocabulary-related achievements (e.g., Learn 100 words)
- `streak` - Streak-based achievements (e.g., 7-day streak)
- `global` - General achievements

## Difficulty Levels

- `easy` - Simple achievements, early milestones
- `normal` - Medium difficulty, moderate effort required
- `hard` - Difficult achievements, long-term goals

## Usage

### 1. Using the Achievement Hook

```typescript
import { useAchievements } from "../hooks/useAchievements";

function ProfileScreen() {
  const { user } = useAuth();

  const {
    achievements, // All user achievements
    stats, // Achievement statistics
    loading, // Loading state
    checkAndUnlock, // Check and unlock achievements
    getUnlockedAchievements,
    getLockedAchievements,
  } = useAchievements(user?._id);

  // Display achievements
  const unlocked = getUnlockedAchievements();
  const locked = getLockedAchievements();
}
```

### 2. Checking Achievements After Lesson Completion

```typescript
const handleSubmit = async () => {
  try {
    // Complete the lesson
    await API.completeLesson(userId, lessonId, category);

    // Check for newly unlocked achievements
    const newAchievements = await checkAndUnlock();

    // Show notification for unlocked achievements
    if (newAchievements.length > 0) {
      setCurrentAchievement(newAchievements[0]);
      setShowModal(true);
    }
  } catch (error) {
    console.error(error);
  }
};
```

### 3. Displaying Achievement Unlock Modal

```typescript
import { AchievementUnlockModal } from "../components/AchievementUnlockModal";

function LessonScreen() {
  const [showModal, setShowModal] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  return (
    <>
      {/* Your lesson content */}

      <AchievementUnlockModal
        visible={showModal}
        achievement={currentAchievement}
        onClose={() => {
          setShowModal(false);
          clearNewlyUnlocked();
        }}
      />
    </>
  );
}
```

## API Endpoints

### Get User Achievements

```
GET /api/achievements/user/:userId
```

Returns all achievements with unlock status for the user.

### Get Achievement Stats

```
GET /api/achievements/user/:userId/stats
```

Returns statistics about user's achievements.

### Check and Unlock Achievements

```
POST /api/achievements/user/:userId/check
```

Checks user's progress and unlocks eligible achievements. Returns newly unlocked achievements.

### Mark Achievement as Notified

```
PUT /api/achievements/user/:userId/notify/:achievementId
```

Marks an achievement as "notified" (user has seen the unlock notification).

## Achievement Conditions

Achievements are unlocked when users meet specific conditions:

```typescript
{
  condition: {
    minLessonsCompleted?: number,  // Total lessons completed
    minWordsLearned?: number,      // Total words learned
    minStreak?: number,            // Consecutive days
    category?: string,             // Specific category (reading, vocab, etc.)
  }
}
```

### Examples:

**First Step**

```typescript
{
  name: "First Step",
  code: "FIRST_LESSON",
  condition: { minLessonsCompleted: 1 },
  difficulty: "easy"
}
```

**Week Warrior**

```typescript
{
  name: "Week Warrior",
  code: "STREAK_7",
  condition: { minStreak: 7 },
  difficulty: "normal"
}
```

**Vocabulary Expert**

```typescript
{
  name: "Vocabulary Expert",
  code: "VOCAB_100",
  condition: { minWordsLearned: 100 },
  difficulty: "hard"
}
```

## Achievement Hook API

### Properties

- `achievements: UserAchievement[]` - All achievements with unlock status
- `stats: AchievementStats | null` - Achievement statistics
- `newlyUnlocked: Achievement[]` - Recently unlocked achievements
- `loading: boolean` - Loading state
- `error: string | null` - Error message

### Methods

- `refresh()` - Refresh achievement list
- `checkAndUnlock()` - Check progress and unlock achievements
- `clearNewlyUnlocked()` - Clear newly unlocked list
- `getUnlockedAchievements()` - Get only unlocked achievements
- `getLockedAchievements()` - Get only locked achievements
- `getAchievementsByDifficulty(difficulty)` - Filter by difficulty
- `getAchievementsByType(type)` - Filter by type
- `calculateProgress(achievement, userProgress)` - Calculate progress %

## Admin Management

Use the Admin Client to manage achievements:

1. Navigate to **Achievements** in the sidebar
2. Create new achievements with conditions
3. Edit existing achievements
4. Delete achievements (will not affect already unlocked)
5. View statistics

## Best Practices

1. **Call `checkAndUnlock()` after meaningful events**:

   - After completing a lesson
   - After updating streak
   - After learning new vocabulary

2. **Show achievement notifications immediately**:

   - Use `AchievementUnlockModal` for visual feedback
   - Don't delay showing unlocks

3. **Display progress on achievements**:

   - Use `calculateProgress()` to show how close users are
   - Motivates users to continue

4. **Don't spam checks**:

   - Only check when progress actually changes
   - Backend has logic to prevent duplicate unlocks

5. **Handle multiple unlocks gracefully**:
   - If multiple achievements unlock, show them sequentially
   - Or show a summary with all unlocked achievements

## Example: Full Integration

See `examples/AchievementIntegrationExample.tsx` for complete integration examples.

## Database Schema

### Achievement

```typescript
{
  name: string,              // Display name
  code: string,              // Unique code (e.g., "FIRST_LESSON")
  description: string,       // Description text
  icon: string,              // Emoji icon
  type: string,              // Achievement type
  difficulty: string,        // easy | normal | hard
  condition: object,         // Unlock conditions
  hidden: boolean,           // Secret achievement
}
```

### UserAchievement

```typescript
{
  userId: ObjectId,          // Reference to user
  achievementId: ObjectId,   // Reference to achievement
  unlockedAt: Date,          // When unlocked
  notified: boolean,         // User has seen notification
}
```

## Troubleshooting

**Achievements not unlocking:**

- Check if backend is running
- Verify user progress is being saved
- Check console for API errors

**Duplicate unlock notifications:**

- Make sure to call `clearNewlyUnlocked()` after showing modal
- Check if `checkAndUnlock()` is being called multiple times

**Stats not updating:**

- Call `fetchStats()` or `refresh()` after unlocking
- The hook automatically refreshes when `checkAndUnlock()` succeeds
