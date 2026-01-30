# Quiz Section

This folder contains all quiz-related files for the SSA Project.

## 📁 File Structure

```
Quiz section/
├── quiz.html     # Main quiz page with all quiz sets
├── quiz.css      # Quiz-specific styles
└── quiz.js       # Quiz logic and functionality
```

## 🎯 Purpose

This folder separates quiz-related code from the main project files for better organization and maintainability.

## 🔗 Dependencies

- **Parent CSS**: `../style.css` - Uses base styles from the main stylesheet
- **Music**: `../music.mp3` - Background music file from the root directory
- **Assets**: References to `../logo.png` and other root-level assets

## 📝 Files Description

### quiz.html
- Contains all quiz sets for different majors (CNTT, SE, AI, SEC, etc.)
- Each quiz set is wrapped in a `<div class="quiz-set" data-subject="...">` container
- Displays 15 questions per quiz
- Shows results in a sticky sidebar

### quiz.css
- Quiz-specific styles including:
  - Question box styling (`.qbox`)
  - Result display (`.reveal`, `.stickyBox`)
  - Animation effects
  - Responsive design for mobile
  - Music button styling
  - Action button styles

### quiz.js
- Quiz logic including:
  - Subject detection from URL parameters
  - Show/hide appropriate quiz set
  - Score calculation for different majors
  - Form submission and validation
  - Result display with animations
  - Music toggle functionality

## 🚀 Usage

### From Root Directory
Users navigate to the quiz via:
1. `index.html` → Select a major
2. `question.html` → Choose what help they need
3. `Quiz section/quiz.html?subject=CODE` → Take the quiz

### Direct Access
You can also access quizzes directly:
- `Quiz section/quiz.html?subject=CNTT` - General IT
- `Quiz section/quiz.html?subject=SE` - Software Engineering
- `Quiz section/quiz.html?subject=AI` - Artificial Intelligence
- `Quiz section/quiz.html?subject=SEC` - Cybersecurity

## 🛠️ Adding New Quizzes

To add a new quiz:

1. **Add quiz set in `quiz.html`**:
   ```html
   <div class="quiz-set" data-subject="YOUR_CODE" style="display:none;">
     <!-- 15 questions here -->
   </div>
   ```

2. **Add majors in `quiz.js`**:
   ```javascript
   const majorsByYOURCODE = {
     option1: { name: "...", score: 0, desc: "..." },
     // ... more options
   };
   ```

3. **Update switch statement in `quiz.js`**:
   ```javascript
   case 'YOUR_CODE':
     majors = majorsByYOURCODE;
     break;
   ```

4. **Add title handling in `quiz.js`**:
   ```javascript
   else if(subject === 'YOUR_CODE') quizTitle.innerText = "Quiz Your Major";
   ```

## 🎨 Styling

The quiz uses a combination of:
- Base styles from `../style.css`
- Quiz-specific styles from `quiz.css`

Key color scheme:
- Primary: `#f97316` (Orange)
- Background: `#f6f7fb` (Light Gray)
- Text: `#1e293b` (Dark Blue)
- Accent: `#6366f1` (Indigo)

## 📱 Responsive Design

The quiz is fully responsive:
- Desktop: Two-column layout (quiz + sidebar)
- Mobile: Single-column layout (stacked)
- Breakpoint: 900px

## ⚙️ Features

- ✅ Multiple quiz sets in one file
- ✅ Dynamic quiz loading based on URL parameter
- ✅ Score calculation and result display
- ✅ Smooth animations and transitions
- ✅ Background music with toggle
- ✅ Form validation
- ✅ Reset functionality
- ✅ Responsive design
- ✅ Accessibility features

## 🔄 Integration

The quiz integrates with:
- `index.html` - Major selection
- `question.html` - Quiz initiation
- `script.js` - Main navigation logic (updated to point to Quiz section)
- `test-quizzes.html` - Testing interface

## 📊 Quiz Types

Currently implemented:
- **CNTT**: General IT specializations
- **SE**: Software Engineering paths (Frontend, Backend, Mobile, etc.)
- **AI**: AI/ML specializations (CV, NLP, ML, DL)
- **SEC**: Cybersecurity roles (Offensive, Defensive, Forensics)

Placeholders for:
- KHCD, VM, CNGT, HTTT, GD (to be developed)
