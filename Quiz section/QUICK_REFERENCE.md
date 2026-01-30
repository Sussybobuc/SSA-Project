# 🎯 Quiz Section - Quick Reference Guide

## 📍 Location
All quiz files are now in: **`Quiz section/`**

## 📂 Files

| File | Purpose |
|------|---------|
| `quiz.html` | Main quiz page with all quiz sets |
| `quiz.css` | All quiz-specific styles |
| `quiz.js` | All quiz logic and functionality |
| `README.md` | Detailed documentation |

## 🔗 Access Quiz

### From User Interface
1. **index.html** → Click a major
2. **question.html** → Click "Chọn chuyên ngành hẹp phù hợp"
3. **Quiz section/quiz.html** → Take quiz

### Direct URL
```
Quiz section/quiz.html?subject=CNTT   # General IT
Quiz section/quiz.html?subject=SE     # Software Engineering
Quiz section/quiz.html?subject=AI     # Artificial Intelligence
Quiz section/quiz.html?subject=SEC    # Cybersecurity
```

## 🎨 Styling

Quiz uses two stylesheets:
1. `../style.css` - Base styles (shared)
2. `quiz.css` - Quiz-specific styles

## 🎵 Assets

- Music: `../music.mp3`
- Logo: `../logo.png` (via base CSS)

## ⚙️ Key Functions (in quiz.js)

```javascript
resetScores()           // Reset all scores to 0
addPoints(value)        // Add points to majors
getAnsweredCount()      // Count answered questions
toggleMusic()           // Toggle background music
```

## 🎯 Available Quizzes

### ✅ Fully Implemented
- **CNTT** - General IT → 5 specializations
- **SE** - Software Engineering → 6 paths
- **AI** - Artificial Intelligence → 5 roles
- **SEC** - Cybersecurity → 5 positions

### 🚧 Placeholders
- KHCD, VM, CNGT, HTTT, GD

## 📊 Quiz Structure

Each quiz has:
- 15 questions
- 3 options per question
- Multiple choice (radio buttons)
- Auto-scoring system
- Top 2 results displayed

## 🛠️ Customization

### Add New Quiz
1. Edit `quiz.html` - Add quiz set
2. Edit `quiz.js` - Add majors object
3. Edit `quiz.js` - Update switch statement
4. Edit `quiz.js` - Add title handling

### Modify Styles
- Edit `quiz.css` for quiz-specific changes
- Edit `../style.css` for global changes

## 🔍 Testing

Use `test-quizzes.html` to quickly test all quizzes.

## 📱 Responsive

- **Desktop**: Side-by-side layout
- **Mobile**: Stacked layout
- **Breakpoint**: 900px

## 🎨 Theme Colors

```css
Primary:    #f97316  /* Orange */
Background: #f6f7fb  /* Light Gray */
Text:       #1e293b  /* Dark Blue */
Accent:     #6366f1  /* Indigo */
```

## ✅ Features Checklist

- [x] Multiple quizzes in one file
- [x] URL parameter routing
- [x] Dynamic quiz loading
- [x] Score calculation
- [x] Animated results
- [x] Music toggle
- [x] Form validation
- [x] Reset functionality
- [x] Responsive design
- [x] Organized file structure

## 🚀 Quick Start

1. Open project in VS Code
2. Navigate to `Quiz section/`
3. Edit files as needed
4. Test using `../test-quizzes.html`
5. Commit changes to Git

## 📞 Integration Points

| File | How It Connects |
|------|-----------------|
| `index.html` | Links via `goQuestion()` function |
| `question.html` | Links via `startQuiz()` function |
| `script.js` | Contains `startQuiz()` redirect |
| `test-quizzes.html` | Direct links to quizzes |

## 🎓 Best Practices

1. **Keep quizzes consistent** - Always 15 questions
2. **Update all 3 files** - When adding new quiz type
3. **Test thoroughly** - Use test-quizzes.html
4. **Follow naming** - Use short, clear subject codes
5. **Document changes** - Update README when adding features

## 🔗 Related Documentation

- `Quiz section/README.md` - Detailed quiz documentation
- `QUIZ_SYSTEM_README.md` - System architecture
- `REORGANIZATION_SUMMARY.md` - What changed
