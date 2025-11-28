# FitSync Database Schema & Relational Diagram

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ BMI : has
    USER ||--o{ WORKOUT_PLAN : creates
    USER ||--o{ WORKOUT_SESSION_LOG : logs
    USER ||--o{ DIET_CHART : generates
    USER ||--o{ MESSAGE : sends
    
    WORKOUT_PLAN ||--o{ WORKOUT_SESSION_LOG : tracks
    WORKOUT_PLAN ||--o{ DIET_CHART : linked_to
    
    USER {
        ObjectId _id PK
        String firstName
        String lastName
        String email UK
        String password
        String username
        String role
        Array workoutPlans FK
        Array workoutSessionLogs FK
        Array diseases
        Array allergies
        Object sportsPreferences
        Number points
        Number weeklyPoints
        Date weeklyStartAt
        Number streakCount
        Date lastActivityAt
        Array badges
        Object weeklyChallenge
        Date createdAt
        Date updatedAt
    }
    
    BMI {
        ObjectId _id PK
        ObjectId userId FK
        Number heightFeet
        Number heightInches
        Number weight
        Number age
        Array diseases
        Array allergies
        Number bmi
        String category
        String selectedPlan
        Number targetWeight
        String targetTimeline
        String aiSuggestions
        Date date
    }
    
    WORKOUT_PLAN {
        ObjectId _id PK
        ObjectId userId FK
        String name
        String description
        Boolean isActive
        Date startDate
        Date endDate
        Number durationWeeks
        Number currentWeek
        Boolean completed
        Date closedAt
        Map weeklyContentOverrides
        Object generatedParams
        Array planContent
        Array scheduledDates
        Number completedDayCount
        Array dayCompletions
        Date createdAt
        Date updatedAt
    }
    
    WORKOUT_SESSION_LOG {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId workoutPlanId FK
        Date date
        Number dayIndex
        Number weekNumber
        Boolean allExercisesCompleted
        Array workoutDetails
        String overallNotes
        Number perceivedExertion
        Number durationMinutes
        Date createdAt
        Date updatedAt
    }
    
    DIET_CHART {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId workoutPlanId FK
        String dietChart
        Number durationWeeks
        Date generatedAt
        Boolean isActive
    }
    
    MESSAGE {
        ObjectId _id PK
        ObjectId user FK
        String name
        String rollNo
        String email
        String item
        String description
        Boolean fakeClaim
        String reportId
        Date createdAt
    }
```

## Detailed Schema Structure

### USER Collection

```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String,
  email: String (required, unique),
  password: String (optional),
  username: String (optional),
  role: String (optional),
  
  // References
  workoutPlans: [ObjectId -> WorkoutPlan],
  workoutSessionLogs: [ObjectId -> WorkoutSessionLog],
  
  // Health Info
  diseases: [String],
  allergies: [String],
  
  // Sports Preferences
  sportsPreferences: {
    preferredSports: [String],
    sportLevel: String (enum: ["beginner", "intermediate", "advanced"]),
    sportGoals: [String]
  },
  
  // Gamification
  points: Number (default: 0),
  weeklyPoints: Number (default: 0),
  weeklyStartAt: Date,
  streakCount: Number (default: 0),
  lastActivityAt: Date,
  badges: [String],
  
  // Weekly Challenge
  weeklyChallenge: {
    title: String,
    target: Number,
    progress: Number,
    completed: Boolean,
    weekStartAt: Date
  },
  
  timestamps: true
}
```

### BMI Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", required),
  heightFeet: Number (required),
  heightInches: Number (required),
  weight: Number (required),
  age: Number (required),
  diseases: [String],
  allergies: [String],
  bmi: Number (required),
  category: String (required),
  selectedPlan: String (enum: ["lose_weight", "gain_weight", "build_muscles"]),
  targetWeight: Number,
  targetTimeline: String,
  aiSuggestions: String,
  date: Date (default: Date.now)
}
```

### WORKOUT_PLAN Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", required),
  name: String (required),
  description: String,
  isActive: Boolean (default: false),
  startDate: Date (default: Date.now),
  endDate: Date,
  durationWeeks: Number (default: 4),
  currentWeek: Number (default: 1),
  completed: Boolean (default: false),
  closedAt: Date,
  
  // Workout Content Structure
  planContent: [{
    day: String,
    focus: String,
    exercises: [{
      name: String,
      sets: Number,
      reps: String,
      weight: String,
      rest: String,
      notes: String,
      demonstrationLink: String
    }],
    warmup: String,
    cooldown: String
  }],
  
  // Scheduled Dates
  scheduledDates: [{
    date: Date,
    dayIndex: Number,
    weekNumber: Number,
    status: String (enum: ["pending", "completed", "missed"]),
    completedAt: Date
  }],
  
  // Progress Tracking
  completedDayCount: Number (default: 0),
  dayCompletions: [{
    weekNumber: Number,
    dayIndex: Number,
    sessionId: ObjectId (ref: "WorkoutSessionLog"),
    date: Date
  }],
  
  // Generation Parameters
  generatedParams: {
    timeCommitment: String,
    workoutType: String,
    intensity: String,
    equipment: String,
    daysPerWeek: Number,
    fitnessGoal: String,
    gender: String,
    strengthLevel: String,
    trainingMethod: String,
    currentWeight: Number,
    targetWeight: Number,
    bmiData: Object
  },
  
  // Weekly Overrides
  weeklyContentOverrides: Map,
  
  timestamps: true
}
```

### WORKOUT_SESSION_LOG Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", required),
  workoutPlanId: ObjectId (ref: "WorkoutPlan", required),
  date: Date (default: Date.now),
  dayIndex: Number,
  weekNumber: Number,
  allExercisesCompleted: Boolean (default: false),
  
  workoutDetails: [{
    exerciseName: String,
    sets: Number,
    reps: String,
    weight: String,
    notes: String,
    completed: Boolean (default: false)
  }],
  
  overallNotes: String,
  perceivedExertion: Number (min: 1, max: 10),
  durationMinutes: Number,
  
  timestamps: true
}
```

### DIET_CHART Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", required),
  workoutPlanId: ObjectId (ref: "WorkoutPlan", required),
  dietChart: String (required),
  durationWeeks: Number (required),
  generatedAt: Date (default: Date.now),
  isActive: Boolean (default: true)
}

// Indexes
Index: { userId: 1, workoutPlanId: 1 }
Index: { userId: 1, isActive: 1 }
```

### MESSAGE Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: "User", required),
  name: String (required),
  rollNo: String (required),
  email: String,
  item: String (required),
  description: String (required),
  fakeClaim: Boolean (default: false),
  reportId: String,
  createdAt: Date (default: Date.now)
}
```

## Relationship Mappings

```mermaid
graph LR
    subgraph "1:Many Relationships"
        U[USER] -->|1:N| B[BMI Records]
        U -->|1:N| WP[Workout Plans]
        U -->|1:N| WSL[Workout Session Logs]
        U -->|1:N| DC[Diet Charts]
        U -->|1:N| M[Messages]
    end
    
    subgraph "Many:1 Relationships"
        WP -->|N:1| U
        WSL -->|N:1| U
        WSL -->|N:1| WP
        DC -->|N:1| U
        DC -->|N:1| WP
        B -->|N:1| U
        M -->|N:1| U
    end
    
    style U fill:#4CAF50
    style B fill:#2196F3
    style WP fill:#FF9800
    style WSL fill:#9C27B0
    style DC fill:#F44336
    style M fill:#00BCD4
```

## Data Flow in Database Operations

```mermaid
flowchart TD
    A[User Action] --> B{Action Type}
    
    B -->|BMI Calculation| C[Create BMI Document]
    C --> D[Store in BMI Collection]
    D --> E[Reference User ID]
    
    B -->|Workout Generation| F[Create WorkoutPlan Document]
    F --> G[Store in WORKOUT_PLAN Collection]
    G --> H[Update User.workoutPlans Array]
    H --> I[Calculate Scheduled Dates]
    I --> J[Store in scheduledDates Array]
    
    B -->|Log Workout| K[Create WorkoutSessionLog]
    K --> L[Store in WORKOUT_SESSION_LOG Collection]
    L --> M[Update User.workoutSessionLogs Array]
    M --> N[Update WorkoutPlan.dayCompletions]
    N --> O[Update WorkoutPlan.scheduledDates Status]
    O --> P[Update User Points & Streak]
    
    B -->|Virtual Training| VTA[Streamlit VTA App]
    VTA --> VTAProcess[YOLOv8 Pose Detection]
    VTAProcess --> VTAFeedback[Real-time Feedback]
    VTAFeedback --> VTALog{Log Session?}
    VTALog -->|Yes| K
    VTALog -->|No| VTAEnd[Session Complete]
    
    B -->|Diet Chart| Q[Create DietChart Document]
    Q --> R[Store in DIET_CHART Collection]
    R --> S[Link to WorkoutPlan]
    S --> T[Update User Points]
    
    style C fill:#FFEB3B
    style F fill:#FF9800
    style K fill:#9C27B0
    style Q fill:#F44336
    style VTA fill:#E91E63
    style VTAProcess fill:#00BCD4
```

## Indexes and Performance Optimization

```javascript
// User Collection Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ "weeklyChallenge.weekStartAt": 1 })

// BMI Collection Indexes
db.bmis.createIndex({ userId: 1, date: -1 }) // For fetching latest BMI
db.bmis.createIndex({ userId: 1 })

// WorkoutPlan Collection Indexes
db.workoutplans.createIndex({ userId: 1, isActive: 1 })
db.workoutplans.createIndex({ userId: 1, createdAt: -1 })
db.workoutplans.createIndex({ "scheduledDates.date": 1 })

// WorkoutSessionLog Collection Indexes
db.workoutsessionlogs.createIndex({ userId: 1, workoutPlanId: 1, date: -1 })
db.workoutsessionlogs.createIndex({ workoutPlanId: 1, date: 1 })

// DietChart Collection Indexes
db.dietcharts.createIndex({ userId: 1, workoutPlanId: 1 })
db.dietcharts.createIndex({ userId: 1, isActive: 1 })
```

## Virtual Training Assistant Integration

The Virtual Training Assistant (VTA) uses computer vision (YOLOv8) for real-time pose estimation and exercise tracking. VTA sessions can optionally be logged to the WorkoutSessionLog collection:

```javascript
// Virtual Training Session (Optional Logging)
{
  userId: ObjectId,
  workoutPlanId: ObjectId (optional, can be standalone),
  date: Date,
  dayIndex: Number (optional for VTA),
  weekNumber: Number (optional for VTA),
  allExercisesCompleted: Boolean,
  workoutDetails: [{
    exerciseName: String, // e.g., "Left Dumbbell Curl", "Lateral Raise"
    sets: Number,
    reps: String,
    weight: String (optional),
    notes: String,
    completed: Boolean
  }],
  overallNotes: String,
  perceivedExertion: Number,
  durationMinutes: Number,
  sessionType: String (enum: ["workout_plan", "virtual_training"]) // New field
}
```

**VTA Features:**
- Real-time pose detection using YOLOv8n-pose model
- Exercise form analysis and feedback
- Automatic rep counting
- Calorie estimation based on exercise type and duration
- Supports: Dumbbell Curls, Lateral Raises, Front Raises, Triceps Kickbacks
- Manual tracking mode (fallback when camera unavailable)

## Key Constraints and Validations

1. **User Email**: Unique constraint enforced at database level
2. **Workout Plan**: Only one active plan per user at a time
3. **Scheduled Dates**: Status enum validation (pending, completed, missed)
4. **Streak Logic**: Calculated based on consecutive days with activity
5. **Weekly Points**: Reset every Monday based on weeklyStartAt
6. **Workout Logging**: Validates that logged date matches scheduled date
7. **Diet Chart**: One active chart per workout plan
8. **Virtual Training**: Optional logging; can be standalone or linked to workout plan

