# END TERM VII SEMESTER SYNOPSIS REPORT

Submitted in partial fulfillment of the requirement of the degree of

# BACHELORS OF TECHNOLOGY

to

# The NorthCap University

by

[Your Name and Roll Number]

Under the supervision of

Dr./Ms./Mr. [Supervisor Name]

[Designation], Department of Computer Science and Engineering

---

Department of Computer Science and Engineering

School of Engineering and Technology

The NorthCap University, Gurugram- 122001, India

Session 2025-26

---

## CERTIFICATE

This is to certify that the Project Synopsis entitled, "GenFit AI: AI-Powered Personalized Fitness and Wellness Platform" submitted by "[Student names]" to The NorthCap University, Gurugram, India, is a record of bona fide synopsis work carried out by them under my supervision and guidance and is worthy of consideration for the partial fulfilment of the degree of Bachelor of Technology in Computer Science and Engineering of the University.

[Signature of supervisor]

[Name and designation of supervisor]

Date: ………………

---

## INDEX

1. Abstract
2. Introduction
   a. Background
   b. Feasibility Study
3. Study of Existing Solution
4. Comparison with Existing Software Solutions
5. Gap Analysis
6. Problem Statement
7. Objectives
8. Tools/Platform Used
9. Design Methodology
10. Outcomes
11. Gantt Chart
12. Responsibility Chart
13. References
14. Annexure I: Screenshots of all the MS-Team meetings (online)/ handwritten comments(offline) from guide

---

# 1. ABSTRACT

GenFit AI is an intelligent, AI-powered fitness and wellness platform designed to provide personalized health and fitness solutions to users. The platform leverages artificial intelligence, machine learning, and computer vision technologies to deliver comprehensive fitness management including BMI tracking, personalized workout plan generation, AI-driven diet chart creation, real-time calorie tracking through image recognition, and gamified fitness engagement.

The system utilizes Google Gemini AI for generating personalized workout plans and diet recommendations, ResNet50 deep learning model for food recognition from images, and MongoDB for efficient data management. The platform features a modern React-based frontend with Tailwind CSS for responsive design, Node.js/Express backend for robust API services, and implements gamification elements including points, streaks, badges, and leaderboards to enhance user engagement and motivation.

GenFit AI addresses the critical gap in existing fitness applications by providing truly personalized, AI-driven recommendations that adapt to individual health profiles, fitness goals, and dietary restrictions. The platform demonstrates significant potential in promoting healthier lifestyles through technology-driven solutions.

Keywords: Artificial Intelligence, Fitness Technology, Health Management, Machine Learning, Computer Vision, Personalized Recommendations, Gamification

---

# 2. INTRODUCTION

## 2.1 Background

The global fitness and wellness industry has experienced exponential growth over the past decade, driven by increasing health awareness, technological advancements, and the proliferation of smartphones and wearable devices. Traditional fitness approaches often lack personalization, making it challenging for individuals to maintain consistency and achieve their health goals effectively.

The integration of Artificial Intelligence (AI) and Machine Learning (ML) in fitness applications has revolutionized how people approach health and wellness. AI-powered systems can analyze vast amounts of user data, including body metrics, activity levels, dietary patterns, and health conditions, to generate highly personalized recommendations that adapt to individual needs and goals.

GenFit AI emerges as a comprehensive solution that combines multiple AI technologies to create a unified platform for fitness management. Unlike conventional fitness apps that offer generic workout plans and static diet recommendations, GenFit AI provides dynamic, personalized guidance that evolves with the user's progress and changing requirements.

The platform addresses several critical challenges in the fitness domain:

- Lack of Personalization: Most fitness apps provide one-size-fits-all solutions without considering individual health profiles, medical conditions, allergies, or specific fitness goals.

- Insufficient Motivation: Many users abandon fitness routines due to lack of engagement and motivation. Traditional tracking methods fail to maintain long-term user interest.

- Complexity in Calorie Tracking: Manual calorie counting is tedious and error-prone. Food recognition through images can significantly simplify this process.

- Limited Integration: Existing solutions often focus on isolated aspects (either workouts or diet) rather than providing a holistic approach to fitness and wellness.

GenFit AI integrates all these components into a cohesive ecosystem, making fitness management more accessible, engaging, and effective for users of all fitness levels.

## 2.2 Feasibility Study

### 2.2.1 Technical Feasibility

The project is technically feasible based on the following considerations:

Frontend Technologies:
- React.js provides a robust framework for building dynamic user interfaces
- Tailwind CSS enables rapid UI development with responsive design
- Modern browser compatibility ensures wide accessibility

Backend Technologies:
- Node.js and Express.js offer scalable server-side architecture
- RESTful API design ensures easy integration and maintenance
- MongoDB provides flexible NoSQL database suitable for user data management

AI/ML Integration:
- Google Gemini API offers state-of-the-art natural language processing capabilities
- Pre-trained models (ResNet50) are available for food recognition
- TensorFlow/PyTorch libraries provide comprehensive ML framework support

Infrastructure:
- Cloud deployment options (Vercel, Railway, etc.) ensure scalability
- Third-party authentication (Google OAuth) reduces development complexity
- API services are well-documented and accessible

### 2.2.2 Economic Feasibility

The project is economically viable because:

- Low Development Cost: Utilizes open-source technologies and frameworks
- Minimal Infrastructure Cost: Cloud platforms offer free tiers for development and testing
- Scalable Pricing: API costs (Gemini) are reasonable for MVP and scalable for production
- No Specialized Hardware Required: Standard development machines are sufficient

### 2.2.3 Operational Feasibility

Operational feasibility is established through:

- User-Friendly Interface: Intuitive design reduces learning curve
- Accessibility: Web-based platform accessible from any device with internet connection
- Maintenance: Modular architecture facilitates easy updates and feature additions
- Support: Comprehensive documentation and error handling improve user experience

### 2.2.4 Time Feasibility

The project timeline is realistic:

- Core Features: 8-10 weeks for development
- Testing and Refinement: 2-3 weeks
- Documentation and Deployment: 1-2 weeks
- Total Duration: 12-15 weeks (aligned with semester timeline)

---

# 3. STUDY OF EXISTING SOLUTION

## 3.1 Current Market Solutions

### 3.1.1 MyFitnessPal

Features:
- Calorie tracking through barcode scanning
- Extensive food database
- Basic workout logging
- Social community features

Limitations:
- Manual entry is time-consuming
- Generic calorie recommendations
- Limited AI-powered personalization
- No integrated workout plan generation
- Basic UI/UX design

### 3.1.2 Fitbit App

Features:
- Activity tracking through wearable integration
- Step counting and basic fitness metrics
- Sleep tracking
- Social challenges

Limitations:
- Requires hardware (Fitbit device)
- Limited dietary planning
- No AI-driven workout customization
- Focus primarily on activity tracking
- Premium features require subscription

### 3.1.3 Nike Training Club

Features:
- Pre-recorded workout videos
- Various workout categories
- Basic progress tracking
- Free access to workout library

Limitations:
- No personalized workout generation
- Static workout plans
- No dietary recommendations
- Limited progress analytics
- No AI-based customization

### 3.1.4 Noom

Features:
- Psychology-based weight loss approach
- Color-coded food system
- Coaching support
- Progress tracking

Limitations:
- High subscription cost
- Limited workout guidance
- Manual calorie logging
- Not focused on muscle building
- Less emphasis on strength training

### 3.1.5 Freeletics

Features:
- Bodyweight exercises
- AI-generated workout plans
- Progress tracking
- Community features

Limitations:
- Limited to bodyweight exercises
- No dietary planning
- Subscription-based model
- Limited exercise variety
- No image-based food recognition

## 3.2 Analysis of Current Solutions

Existing fitness applications exhibit several common limitations:

1. Lack of Comprehensive Integration: Most apps focus on either diet OR workouts, not both
2. Limited AI Personalization: Few solutions truly leverage AI for dynamic recommendations
3. Manual Data Entry: Calorie tracking requires extensive manual input
4. Poor User Engagement: Lack of gamification leads to low user retention
5. Generic Recommendations: One-size-fits-all approach without considering individual health profiles
6. Insufficient Analytics: Basic progress tracking without actionable insights

---

# 4. COMPARISON WITH EXISTING SOFTWARE SOLUTIONS

| Feature | GenFit AI | MyFitnessPal | Fitbit | Nike Training Club | Noom |
|---------|-----------|--------------|--------|-------------------|------|
| AI-Powered Workout Generation | ✓ Yes | ✗ No | ✗ No | ✗ No | ✗ No |
| AI-Powered Diet Planning | ✓ Yes | ✗ No | ✗ No | ✗ No | ✗ Limited |
| Image-Based Food Recognition | ✓ Yes | ✗ No (Barcode only) | ✗ No | ✗ No | ✗ No |
| Personalized Recommendations | ✓ Yes | ✗ No | ✗ Limited | ✗ No | ✓ Limited |
| Health Profile Integration | ✓ Yes | ✗ No | ✗ Limited | ✗ No | ✓ Yes |
| Gamification (Points, Badges) | ✓ Yes | ✗ No | ✓ Limited | ✗ No | ✗ No |
| BMI Tracking with AI Insights | ✓ Yes | ✓ Basic | ✓ Basic | ✗ No | ✓ Basic |
| Comprehensive Dashboard | ✓ Yes | ✓ Yes | ✓ Yes | ✗ No | ✓ Yes |
| Progress Analytics | ✓ Advanced | ✓ Basic | ✓ Basic | ✓ Basic | ✓ Basic |
| Free Access | ✓ Yes | ✓ Limited | ✗ No | ✓ Yes | ✗ No |
| Disease/Allergy Consideration | ✓ Yes | ✗ No | ✗ No | ✗ No | ✓ Limited |

### Key Differentiators of GenFit AI:

1. Integrated AI Ecosystem: Seamless integration of AI for both workouts and diet planning
2. Computer Vision for Nutrition: Automated calorie tracking through image recognition
3. Holistic Health Approach: Considers BMI, diseases, allergies, and fitness goals together
4. Gamification: Advanced engagement system with points, streaks, badges, and leaderboards
5. Cost-Effective: Free access to core features with comprehensive functionality
6. Adaptive Recommendations: Dynamic plan generation that evolves with user progress

---

# 5. GAP ANALYSIS

## 5.1 Identified Gaps in Current Solutions

### 5.1.1 Technology Gaps

- Limited AI Integration: Most applications use rule-based systems rather than true AI for personalization
- No Computer Vision: Manual food entry dominates; image recognition is rare
- Static Recommendations: Plans don't adapt based on user progress or feedback
- Fragmented Data: User health data is not integrated across features

### 5.1.2 Feature Gaps

- No Unified Platform: Workout and diet features are typically separate
- Insufficient Personalization: Limited consideration of health conditions, allergies, and preferences
- Poor Engagement Mechanisms: Lack of gamification leads to low user retention
- Limited Analytics: Basic tracking without actionable insights or trend analysis

### 5.1.3 User Experience Gaps

- Complex Interfaces: Overwhelming UI with too many options
- Time-Consuming Data Entry: Extensive manual input required
- Lack of Motivation: No social or competitive elements to maintain engagement
- Inadequate Guidance: Generic advice without context-aware recommendations

## 5.2 Gaps Addressed by GenFit AI

### 5.2.1 Technology Solutions

- Advanced AI Integration: Google Gemini API for intelligent workout and diet generation
- Computer Vision: ResNet50 model for automated food recognition
- Dynamic Adaptation: Weekly plan regeneration based on progress
- Unified Data Model: Comprehensive user profile influencing all recommendations

### 5.2.2 Feature Solutions

- Holistic Platform: Integrated workout planning, diet charting, and calorie tracking
- Deep Personalization: BMI, diseases, allergies, and goals all considered
- Gamification System: Points, streaks, badges, and leaderboards for engagement
- Advanced Analytics: Adherence tracking, progress visualization, and trend analysis

### 5.2.3 User Experience Solutions

- Clean, Modern Interface: Intuitive dashboard with quick actions
- Automated Processes: Image-based calorie tracking reduces manual work
- Motivation Systems: Gamification and social elements (leaderboards)
- Context-Aware Guidance: AI-powered insights based on individual profiles

---

# 6. PROBLEM STATEMENT

The contemporary fitness and wellness landscape is characterized by fragmented solutions that fail to provide comprehensive, personalized guidance to users. Existing applications suffer from several critical limitations:

1. Fragmented Solutions: Current fitness applications typically focus on isolated aspects (workouts OR diet OR tracking) rather than providing an integrated ecosystem that addresses fitness holistically.

2. Lack of True Personalization: Most platforms offer generic recommendations without considering individual health profiles, medical conditions, dietary restrictions, fitness levels, and specific goals.

3. Poor User Engagement: Traditional tracking methods fail to maintain long-term user motivation, resulting in high abandonment rates and low adherence to fitness routines.

4. Inefficient Data Entry: Manual calorie counting and workout logging are time-consuming and error-prone, creating barriers to consistent usage.

5. Insufficient Intelligence: Limited use of AI and machine learning results in static recommendations that don't adapt to user progress or changing needs.

6. Inadequate Health Integration: Many solutions ignore critical health factors such as BMI, existing medical conditions, allergies, and body composition, leading to potentially unsafe or ineffective recommendations.

Therefore, there is a critical need for an intelligent, AI-powered platform that integrates personalized workout planning, dietary recommendations, automated calorie tracking, and gamified engagement mechanisms into a unified ecosystem that adapts to individual user profiles and promotes sustainable fitness habits.

---

# 7. OBJECTIVES

## 7.1 Primary Objectives

1. To develop an AI-powered fitness platform that provides personalized workout plans based on individual health profiles, fitness goals, and constraints.

2. To implement intelligent diet chart generation that considers BMI, medical conditions, allergies, and dietary preferences to create customized nutritional plans.

3. To create an automated calorie tracking system using computer vision and deep learning for food recognition from images, reducing manual data entry.

4. To design and implement a comprehensive gamification system including points, streaks, badges, and leaderboards to enhance user engagement and motivation.

5. To build an integrated dashboard that provides comprehensive analytics, progress tracking, and actionable insights for users to monitor their fitness journey.

## 7.2 Secondary Objectives

1. To integrate BMI tracking with AI-generated health insights and recommendations.

2. To develop a Virtual Training Assistant that provides real-time exercise guidance and form correction.

3. To create an AI Coach chatbot that answers fitness-related queries using context from user profiles.

4. To implement a robust user authentication system with Google OAuth integration for secure access.

5. To ensure responsive design and cross-platform compatibility for accessibility across devices.

## 7.3 Technical Objectives

1. To leverage Google Gemini AI for generating contextual and personalized fitness and dietary recommendations.

2. To implement ResNet50 deep learning model for accurate food recognition from images.

3. To design a scalable MongoDB database schema for efficient storage and retrieval of user data.

4. To develop RESTful APIs using Node.js/Express for seamless frontend-backend communication.

5. To ensure code modularity and maintainability through proper software engineering practices.

---

# 8. TOOLS/PLATFORM USED

The GenFit AI platform has been developed using a comprehensive stack of modern technologies, frameworks, and tools. The technology stack has been carefully selected to ensure scalability, maintainability, and optimal performance across all components of the application.

8.1 Frontend Technologies

The frontend of the application is built using React.js (version 18.x) as the primary framework for constructing dynamic and interactive user interfaces. JavaScript (ES6+) serves as the core programming language, enabling modern JavaScript features and syntax. For styling and responsive design, Tailwind CSS (version 3.x) is utilized as a utility-first CSS framework, allowing for rapid UI development with consistent design patterns. React Router (version 6.x) handles client-side routing and navigation throughout the application. State management is implemented using Redux Toolkit, which provides efficient and predictable state management across components. Axios is used as the HTTP client library for making API requests to the backend server. React Icons library provides a comprehensive collection of icons for UI elements, while React Toastify handles notification and alert systems for user feedback. Vite serves as the build tool and development server, offering fast development experience and optimized production builds.

8.2 Backend Technologies

The backend architecture is constructed using Node.js (version 18.x and above) as the JavaScript runtime environment, enabling server-side JavaScript execution. Express.js (version 4.x) is employed as the web application framework, providing robust middleware support and routing capabilities for building RESTful APIs. MongoDB is utilized as the NoSQL database for flexible and efficient data storage and retrieval. Mongoose serves as the MongoDB object modeling library, simplifying database interactions and providing schema validation. JSON Web Token (JWT) is implemented for secure authentication token management and user session handling. Bcrypt library is used for password hashing and encryption to ensure secure password storage. Dotenv manages environment variables, allowing for secure configuration management across different deployment environments. Cookie-parser middleware handles cookie parsing in HTTP requests, while CORS (Cross-Origin Resource Sharing) middleware enables secure cross-origin API requests between frontend and backend.

8.3 AI/ML Technologies

Artificial Intelligence and Machine Learning capabilities are integrated through several key technologies. Google Gemini API is utilized for AI-powered workout plan generation, diet chart creation, and chatbot functionality, providing natural language processing and intelligent recommendations. TensorFlow serves as the deep learning framework for food recognition tasks, offering comprehensive ML tools and libraries. PyTorch is used as an alternative machine learning framework, specifically for ResNet50 model implementation. ResNet50, a pre-trained convolutional neural network model, is employed for accurate food image classification and recognition. OpenCV (Open Source Computer Vision Library) is utilized for image processing operations, including image manipulation and feature extraction. NumPy provides numerical computing capabilities for efficient image preprocessing and mathematical operations required for machine learning models.

8.4 Development Tools

The development process utilized several essential tools for efficient coding, testing, and debugging. Visual Studio Code served as the primary code editor, providing an integrated development environment with extensions and debugging capabilities. Git and GitHub were used for version control, enabling collaborative development and code repository management. Postman was employed for API testing, allowing for thorough testing of all backend endpoints before frontend integration. MongoDB Compass provided a graphical user interface for database management, enabling easy database querying and data visualization. Chrome DevTools was used extensively for debugging, performance analysis, and frontend development troubleshooting.

8.5 Deployment Platforms

The application is deployed using modern cloud platforms to ensure scalability and reliability. Vercel is used for frontend hosting, providing fast CDN delivery and automatic deployments from Git repositories. Railway or Render platforms are utilized for backend hosting, offering seamless deployment and scaling capabilities for Node.js applications. MongoDB Atlas serves as the cloud database hosting service, providing managed MongoDB instances with automatic backups and high availability.

8.6 Third-Party Services

Several third-party services are integrated to enhance the application's functionality. Google OAuth 2.0 is implemented for secure user authentication, allowing users to sign in using their Google accounts. Cloudinary (optional) can be utilized for advanced image storage and processing capabilities, though the current implementation uses local image handling for the food recognition feature.

---

# 9. DESIGN METHODOLOGY

## 9.1 Software Development Life Cycle (SDLC)

The project follows an Agile/Iterative Development Methodology with the following phases:

### Phase 1: Requirements Analysis (Weeks 1-2)

Activities:
- Stakeholder requirement gathering
- Feature identification and prioritization
- Technical feasibility assessment
- Technology stack selection

Deliverables:
- Requirement specification document
- Feature list and user stories
- Technology stack documentation

### Phase 2: System Design (Weeks 2-3)

Activities:
- Database schema design
- API endpoint planning
- UI/UX wireframing
- System architecture design
- Component structure planning

Deliverables:
- Database schema diagrams
- API documentation
- UI mockups
- System architecture diagram

### Phase 3: Development - Core Features (Weeks 4-7)

Activities:
- User authentication implementation
- BMI calculator with AI integration
- Workout plan generator
- Diet chart generator
- Database setup and models

Deliverables:
- Working authentication system
- BMI tracking module
- AI-powered workout generation
- Diet planning module

### Phase 4: Development - Advanced Features (Weeks 8-10)

Activities:
- Calorie tracker with image recognition
- Gamification system implementation
- Dashboard development
- Leaderboard system
- Progress analytics

Deliverables:
- Food recognition system
- Points and badge system
- Comprehensive dashboard
- Leaderboard functionality

### Phase 5: Integration and Testing (Weeks 11-12)

Activities:
- Feature integration
- Unit testing
- Integration testing
- User acceptance testing
- Bug fixing and optimization

Deliverables:
- Fully integrated system
- Test reports
- Bug fix documentation

### Phase 6: Deployment and Documentation (Weeks 13-14)

Activities:
- Cloud deployment
- User documentation
- Technical documentation
- Presentation preparation

Deliverables:
- Deployed application
- User manual
- Technical documentation
- Project presentation

## 9.2 System Architecture

### 9.2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  (React Frontend - Vercel)                                  │
│  - User Interface                                            │
│  - State Management (Redux)                                  │
│  - Routing (React Router)                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS/REST API
                         │
┌────────────────────────┴────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  (Node.js/Express - Railway)                                │
│  - RESTful APIs                                             │
│  - Business Logic                                           │
│  - Authentication Middleware                                 │
│  - Request Validation                                       │
└────────┬─────────────────────────────┬──────────────────────┘
         │                             │
         │                             │
┌────────┴─────────┐        ┌─────────┴────────────┐
│   DATA LAYER     │        │      AI LAYER        │
│  (MongoDB Atlas) │        │                      │
│  - User Data     │        │  - Google Gemini API │
│  - Workout Plans │        │  - ResNet50 Model    │
│  - Diet Charts   │        │  - Image Processing  │
│  - Progress Logs │        │                      │
└──────────────────┘        └──────────────────────┘
```

### 9.2.2 Database Schema Design

User Schema:
```
- _id (ObjectId)
- firstName (String)
- lastName (String)
- email (String, unique)
- password (String, hashed)
- role (String)
- diseases (Array)
- allergies (Array)
- points (Number)
- weeklyPoints (Number)
- streakCount (Number)
- badges (Array)
- weeklyChallenge (Object)
- lastActivityAt (Date)
- createdAt (Date)
```

BMI Schema:
```
- _id (ObjectId)
- userId (ObjectId, ref: User)
- heightFeet (Number)
- heightInches (Number)
- weight (Number)
- age (Number)
- diseases (Array)
- allergies (Array)
- bmi (Number)
- category (String)
- selectedPlan (String)
- targetWeight (Number)
- targetTimeline (String)
- aiSuggestions (String)
- date (Date)
```

WorkoutPlan Schema:
```
- _id (ObjectId)
- userId (ObjectId, ref: User)
- name (String)
- description (String)
- planContent (Array)
- generatedParams (Object)
- durationWeeks (Number)
- isActive (Boolean)
- completed (Boolean)
- currentWeek (Number)
- dayCompletions (Array)
- completedDayCount (Number)
- createdAt (Date)
```

DietChart Schema:
```
- _id (ObjectId)
- userId (ObjectId, ref: User)
- workoutPlanId (ObjectId, ref: WorkoutPlan)
- dietChart (String)
- durationWeeks (Number)
- isActive (Boolean)
- createdAt (Date)
```

### 9.2.3 API Design

Authentication Endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/generate-plan` - Generate workout plan
- `POST /api/auth/workout-plan/save` - Save workout plan
- `GET /api/auth/workout-plan/active/:userId` - Get active plan
- `POST /api/auth/workout-session/log` - Log workout session
- `GET /api/auth/workout-plan/history/:userId` - Get plan history

BMI Endpoints:
- `POST /api/bmi/save` - Save BMI record
- `GET /api/bmi/history` - Get BMI history
- `PUT /api/bmi/update` - Update BMI
- `GET /api/bmi/progress` - Get progress tracking

Gamification Endpoints:
- `GET /api/gamify/stats` - Get user stats
- `GET /api/gamify/leaderboard` - Get leaderboard
- `GET /api/gamify/adherence` - Get adherence analytics

Diet Endpoints:
- `POST /api/auth/generate-diet-chart` - Generate diet chart
- `POST /api/auth/diet-chart/save` - Save diet chart
- `GET /api/auth/diet-chart/:userId/:workoutPlanId` - Get diet chart

## 9.3 Algorithm Design

### 9.3.1 Workout Plan Generation Algorithm

```
1. Receive user input:
   - Fitness goal (lose_weight/gain_weight/build_muscles)
   - Gender, age, BMI data
   - Strength level, time commitment
   - Days per week, duration in weeks
   - Diseases, allergies

2. Construct prompt for Gemini AI:
   - Include all user parameters
   - Specify output format (JSON array)
   - Request personalized exercise recommendations

3. Call Gemini API with prompt

4. Parse AI response:
   - Extract JSON workout plan
   - Validate structure
   - Map exercises to format

5. Save plan to database:
   - Link to user
   - Mark as active
   - Set duration and schedule

6. Return plan to frontend
```

### 9.3.2 Food Recognition Algorithm

```
1. Receive food image from user

2. Preprocess image:
   - Resize to 224x224
   - Normalize pixel values
   - Convert to tensor format

3. Load pre-trained ResNet50 model

4. Forward pass through model:
   - Extract features
   - Generate predictions
   - Get top 3 classes

5. Map ImageNet classes to food database:
   - Match class IDs to food items
   - Calculate confidence scores

6. Estimate portion size:
   - Use OpenCV for contour detection
   - Calculate area
   - Classify as small/medium/large

7. Calculate nutrition:
   - Lookup food in database
   - Apply portion multiplier
   - Return calories, macros

8. Return results to user
```

### 9.3.3 Gamification Algorithm

```
1. On user action (BMI save, workout log):
   - Determine action type
   - Calculate base points

2. Check streak:
   - Compare lastActivityAt with current date
   - If consecutive day: increment streak
   - If gap: reset streak to 1
   - Award streak bonus if applicable

3. Update weekly challenge:
   - If workout logged: increment progress
   - Check if target reached
   - Award bonus and badge if completed

4. Check badge eligibility:
   - Evaluate streak milestones (3, 7, 14, 30 days)
   - Evaluate point milestones (1K, 5K)
   - Award new badges

5. Update user record:
   - Increment total points
   - Increment weekly points
   - Update streak count
   - Update badges array
   - Save to database

6. Return updated stats
```

## 9.4 User Interface Design

### 9.4.1 Design Principles

- Simplicity: Clean, uncluttered interfaces
- Responsiveness: Mobile-first design approach
- Accessibility: High contrast, readable fonts
- Consistency: Uniform design language across pages
- Feedback: Clear success/error messages

### 9.4.2 Key Pages

1. Homepage: Hero section, features, call-to-action
2. Dashboard: Stats cards, progress charts, quick actions
3. BMI Calculator: Input form, results display, AI insights
4. Workout Generator: Plan configuration, AI-generated plan
5. Diet Chart: AI-generated meal plans
6. Calorie Tracker: Image upload, recognition results
7. Leaderboard: Weekly and all-time rankings
8. Profile: User settings, preferences

---

# 10. OUTCOMES

## 10.1 Functional Outcomes

### 10.1.1 Core Features Implemented

1. AI-Powered Workout Plan Generator
   - Successfully generates personalized workout plans based on user profile
   - Considers fitness goals, health conditions, and constraints
   - Provides weekly plan variations for progressive improvement
   - Achieves high relevance through Gemini AI integration

2. Intelligent Diet Chart Generator
   - Creates customized meal plans aligned with workout goals
   - Integrates dietary restrictions, allergies, and preferences
   - Provides detailed nutritional information per meal
   - Supports multiple diet types and fitness objectives

3. BMI Tracking with AI Insights
   - Accurate BMI calculation from height and weight
   - Category classification (Underweight, Normal, Overweight, Obese)
   - AI-generated health recommendations and tips
   - Historical tracking for progress monitoring

4. Image-Based Calorie Tracking
   - Food recognition from images using ResNet50 model
   - Automated portion size estimation
   - Nutritional information calculation
   - Meal history tracking with visual records

5. Comprehensive Gamification System
   - Point-based reward system for user actions
   - Streak tracking to encourage daily engagement
   - Badge system for milestone achievements
   - Leaderboard for competitive motivation

6. Advanced Dashboard
   - Real-time statistics display (points, streaks, badges)
   - Weekly challenge progress tracking
   - Workout adherence analytics
   - Quick action buttons for common tasks

7. Virtual Training Assistant
   - Real-time exercise guidance
   - Form correction suggestions
   - Exercise demonstration links

8. AI Coach Chatbot
   - Context-aware fitness advice
   - Integration with user health profile
   - Personalized recommendations based on active plans

### 10.1.2 Technical Outcomes

1. Scalable Architecture
   - Modular frontend-backend separation
   - RESTful API design for easy integration
   - Database schema optimized for queries
   - Cloud-ready deployment configuration

2. AI Integration
   - Successful integration of Google Gemini API
   - ResNet50 model implementation for image recognition
   - Efficient prompt engineering for optimal AI responses
   - Error handling and fallback mechanisms

3. User Experience
   - Responsive design across devices
   - Fast load times and smooth interactions
   - Intuitive navigation and clear feedback
   - Accessibility considerations implemented

4. Data Management
   - Secure user authentication (Google OAuth)
   - Efficient data storage and retrieval
   - Progress tracking and historical data
   - Privacy and security best practices

## 10.2 Quantitative Outcomes

| Metric | Value |
|--------|-------|
| Features Implemented | 15+ major features |
| API Endpoints | 20+ RESTful endpoints |
| Database Collections | 7+ collections |
| Food Items Recognized | 46+ items |
| Badge Types | 6+ badge categories |
| Response Time (API) | < 2 seconds average |
| Image Recognition Accuracy | ~70-80% (baseline model) |
| Code Coverage | Modular, maintainable structure |

## 10.3 Qualitative Outcomes

### 10.3.1 User Benefits

1. Personalization: Users receive tailored recommendations based on their unique profiles
2. Convenience: Automated processes reduce manual data entry significantly
3. Motivation: Gamification elements increase engagement and adherence
4. Education: AI insights help users understand their health better
5. Accessibility: Web-based platform accessible from any device

### 10.3.2 Technical Achievements

1. Modern Tech Stack: Leverages cutting-edge technologies (React, Node.js, AI)
2. Best Practices: Follows software engineering best practices
3. Scalability: Architecture supports future feature additions
4. Maintainability: Clean, documented code for easy maintenance
5. Innovation: Combines multiple AI technologies in unified platform

## 10.4 Project Deliverables

1. Functional Web Application
   - Fully deployed and accessible platform
   - All core features operational
   - Responsive design across devices

2. Source Code
   - Well-documented frontend code
   - Organized backend API code
   - AI/ML implementation code
   - Repository with version control

3. Documentation
   - User manual/guide
   - Technical documentation
   - API documentation
   - Deployment guide

4. Testing
   - Unit tests for critical functions
   - Integration test results
   - User acceptance testing outcomes

---

# 11. GANTT CHART

| Task | Week 1-2 | Week 3-4 | Week 5-6 | Week 7-8 | Week 9-10 | Week 11-12 | Week 13-14 |
|------|----------|----------|----------|----------|-----------|------------|------------|
| Requirements Analysis | ████████ |          |          |          |           |            |            |
| System Design |          | ████████ |          |          |           |            |            |
| Database Setup |          | ████     |          |          |           |            |            |
| User Authentication |          |          | ████████ |          |           |            |            |
| BMI Calculator |          |          | ████████ |          |           |            |            |
| Workout Generator |          |          |          | ████████ |           |            |            |
| Diet Chart Generator |          |          |          | ████████ |           |            |            |
| Calorie Tracker |          |          |          |          | ████████  |            |            |
| Gamification System |          |          |          |          | ████████  |            |            |
| Dashboard Development |          |          |          |          |           | ████████   |            |
| Integration & Testing |          |          |          |          |           | ████████   |            |
| Deployment |          |          |          |          |           |            | ████████   |
| Documentation |          |          |          |          |           |            | ████████   |

Legend:
- ████ = Active Development
- ════ = Planning/Design Phase

---

# 12. RESPONSIBILITY CHART

## 12.1 Project Team Structure

Project Duration: 14 Weeks
Team Size: Individual Project / Group Project (as applicable)

## 12.2 Responsibility Matrix

| Task/Component | Student 1 | Student 2 | Student 3 | Supervisor |
|----------------|-----------|-----------|-----------|------------|
| Requirements Gathering | Lead | Support | Support | Review |
| System Design | Lead | Support | Support | Review |
| Frontend Development | Lead | Support | - | Review |
| Backend Development | Lead | Support | - | Review |
| AI Integration | Lead | - | - | Review |
| Database Design | Lead | Support | - | Review |
| Testing | Lead | Support | Support | Review |
| Documentation | Lead | Support | Support | Review |
| Deployment | Lead | Support | - | Review |
| Presentation | Lead | Support | Support | Review |

Note: Adjust responsibilities based on actual team structure.

## 12.3 Key Responsibilities

### Student Responsibilities:
- Development of assigned modules
- Code documentation and comments
- Unit testing of developed features
- Regular progress updates to supervisor
- Report writing and documentation
- Presentation preparation

### Supervisor Responsibilities:
- Guidance on technical decisions
- Review of design and implementation
- Feedback on progress
- Evaluation of deliverables
- Approval of final submission

---

# 13. REFERENCES

## 13.1 Research Papers

1. Karpathy, A., et al. (2014). "Large-Scale Video Classification with Convolutional Neural Networks." *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*.

2. He, K., et al. (2016). "Deep Residual Learning for Image Recognition." *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*.

3. Devlin, J., et al. (2019). "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding." *NAACL-HLT*.

4. Goodfellow, I., et al. (2016). *Deep Learning*. MIT Press.

5. LeCun, Y., Bengio, Y., & Hinton, G. (2015). "Deep Learning." *Nature*, 521(7553), 436-444.

## 13.2 Books

1. Flanagan, D. (2020). *JavaScript: The Definitive Guide*. O'Reilly Media.

2. Banks, A., & Porcello, E. (2020). *Learning React: Modern Patterns for Developing React Apps*. O'Reilly Media.

3. Subramanian, V. (2018). *Pro MERN Stack: Full Stack Web App Development with Mongo, Express, React, and Node*. Apress.

4. Wilson, E. (2018). *MongoDB: The Definitive Guide*. O'Reilly Media.

## 13.3 Online Resources

1. React Documentation. (2024). *React - A JavaScript library for building user interfaces*. https://react.dev/

2. Node.js Documentation. (2024). *Node.js*. https://nodejs.org/en/docs/

3. MongoDB Documentation. (2024). *MongoDB Manual*. https://www.mongodb.com/docs/

4. Google AI. (2024). *Gemini API Documentation*. https://ai.google.dev/docs

5. Tailwind CSS. (2024). *Tailwind CSS Documentation*. https://tailwindcss.com/docs

6. Express.js. (2024). *Express - Node.js web application framework*. https://expressjs.com/

7. TensorFlow. (2024). *TensorFlow Documentation*. https://www.tensorflow.org/learn

8. PyTorch. (2024). *PyTorch Documentation*. https://pytorch.org/docs/stable/index.html

## 13.4 Websites and Articles

1. MyFitnessPal. (2024). *Official Website*. https://www.myfitnesspal.com/

2. Fitbit. (2024). *Official Website*. https://www.fitbit.com/

3. Noom. (2024). *Official Website*. https://www.noom.com/

4. Medium. (2024). *AI in Fitness Technology*. Various articles on AI applications in health and fitness.

5. GitHub. (2024). *Open Source Fitness Applications*. Repository references for similar projects.

## 13.5 Technical Documentation

1. MDN Web Docs. (2024). *JavaScript Reference*. https://developer.mozilla.org/en-US/docs/Web/JavaScript

2. W3Schools. (2024). *Web Development Tutorials*. https://www.w3schools.com/

3. Stack Overflow. (2024). *Programming Q&A Community*. https://stackoverflow.com/

4. Redux Documentation. (2024). *Redux - A Predictable State Container for JS Apps*. https://redux.js.org/

---

# 14. ANNEXURE I

## 14.1 Screenshots of MS-Team Meetings (Online)

*[Space for screenshots of supervisor meetings]*

Meeting 1: Date: [Date], Topic: Requirements Discussion
Meeting 2: Date: [Date], Topic: Design Review
Meeting 3: Date: [Date], Topic: Progress Update
Meeting 4: Date: [Date], Topic: Implementation Review
Meeting 5: Date: [Date], Topic: Final Review

## 14.2 Handwritten Comments (Offline)

*[Space for scanned copies of handwritten feedback from supervisor]*

---

## APPENDIX

### A. Screenshots of Application

*[Include screenshots of:*
- *Homepage*
- *Dashboard*
- *BMI Calculator*
- *Workout Generator*
- *Diet Chart*
- *Calorie Tracker*
- *Leaderboard*
- *Profile Page*]

### B. Code Samples

*[Include key code snippets demonstrating:*
- *AI integration*
- *Database models*
- *API endpoints*
- *Frontend components*]

### C. Database Schema Diagrams

*[Include ER diagrams and collection structures]*

### D. API Documentation

*[Include detailed API endpoint documentation with request/response examples]*

---

END OF REPORT

---

Prepared by:
[Student Name(s)]
[Roll Number(s)]
[Date]

Approved by:
[Supervisor Name]
[Designation]
[Date]

---

*This synopsis report contains approximately 25+ pages covering all aspects of the GenFit AI project, providing comprehensive documentation for academic submission.*

