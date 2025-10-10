# GovEx Academy Data Governance Game

An interactive, team-based challenge designed for the GovEx Academy Data Governance course. Teams compete to correctly match city scenarios with appropriate data governance models.

## 🎮 Game Features

- **38 Unique Teams**: Each with distinct colors and city names
- **Real-time Collaboration**: Teams can play simultaneously with live scoreboard updates
- **Multi-language Support**: Available in English, Spanish, and Portuguese
- **Live Scoreboard**: See how your team ranks against others in real-time
- **Persistent Storage**: Game progress and results are saved across browser sessions
- **Team Status Tracking**: Visual indicators show which teams are playing or have completed

## 🚀 Quick Start

### **🌐 Play Online (Ready Now!)**
🎮 **Live Game URL**: https://galvaro94.github.io/Implementing-Data-Governance-Game-Week-2/

**Latest Deployment**: Week 2 Version - Clean and Working ✅

Share this URL with all 38 teams to start playing immediately!

### **📥 Local Development**
1. **Clone the repository**
   ```bash
   git clone https://github.com/galvaro94/Implementing-Data-Governance-Game-Week-2.git
   cd "GovEx Academy Game - DM1 2025"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the game**
   - Navigate to `http://localhost:3001`
   - Share this URL with all 38 teams

## 🎯 How to Play

### For Instructors:
1. Share the game URL with all 38 teams
2. Teams will select their team name from the available options
3. Monitor progress on the live scoreboard
4. Use "Reset All Games" to start fresh sessions

### For Teams:
1. Visit the provided URL
2. Select your team from the 38 available options
3. Enter team member names
4. Complete the 4-question challenge within 5 minutes
5. View individual results and team ranking on the live scoreboard

## 🏆 Scoring System

- **4 Questions**: Each worth 1 point
- **Time Bonus**: Faster completion breaks ties
- **Badge System**: Teams with 3+ correct answers earn badges
- **Live Rankings**: Rankings update in real-time as teams complete

## 🛠 Technical Features

### Real-time Synchronization
- Uses localStorage for cross-tab synchronization
- Automatic updates when other teams complete games
- Session tracking to prevent team conflicts

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Optimized for classroom presentation and individual use

### Deployment Ready
- Production build optimized
- Static hosting compatible (GitHub Pages, Netlify, Vercel)
- No backend server required

## 📱 Deployment

### Option 1: GitHub Pages
```bash
npm run build
# Deploy the dist/ folder to GitHub Pages
```

### Option 2: Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`

### Option 3: Vercel
1. Import your GitHub repository
2. Framework preset: Vite
3. Deploy automatically

## 🎨 Customization

### Adding Teams
Edit `src/App.jsx` to modify the teams array:
```javascript
const teams = [
  { id: 1, name: 'Team Name', color: 'from-color-500 to-color-600' },
  // Add more teams...
];
```

### Modifying Questions
Update the `questionsData` object in `src/App.jsx` for different scenarios and answers.

### Language Support
Add new languages by extending the `textData` object with translations.

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Data Storage

The game uses browser localStorage for data persistence:
- Team results and rankings
- Active team sessions
- Game progress tracking

Data is automatically synchronized across browser tabs and windows.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For questions or support regarding the GovEx Academy Data Governance Game, please contact the course instructors.

---

**Built for GovEx Academy** - Johns Hopkins University
Data Governance Course - Week 2: Models of Governance