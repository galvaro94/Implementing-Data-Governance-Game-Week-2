# Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- Git repository set up
- Build tested locally (`npm run build`)

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings > Pages
   - Source: GitHub Actions
   - The workflow will automatically deploy

3. **Access the game**:
   - URL: `https://[username].github.io/[repository-name]`
   - Share this URL with all 8 teams

### Option 2: Netlify

1. **Connect Repository**:
   - Go to [Netlify](https://netlify.com)
   - "New site from Git" > Connect GitHub
   - Select your repository

2. **Configure Build**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Deploy site

3. **Custom Domain (Optional)**:
   - Go to Site settings > Domain management
   - Add custom domain

### Option 3: Vercel

1. **Import Project**:
   - Go to [Vercel](https://vercel.com)
   - Import Git Repository
   - Select your repository

2. **Deploy**:
   - Framework preset: Vite
   - Root directory: `./`
   - Deploy

## 🔧 Configuration

### Environment Variables
The application uses these optional environment variables:
- `VITE_APP_TITLE`: Application title
- `VITE_APP_VERSION`: Version number
- `VITE_APP_DESCRIPTION`: App description

### Domain Setup
If using a custom domain:
1. Update the domain in deployment settings
2. Configure DNS records
3. Enable HTTPS

## 🎯 Post-Deployment Checklist

### ✅ Functionality Test
- [ ] Team selection works
- [ ] Game questions load properly
- [ ] Timer functions correctly
- [ ] Scoreboard updates in real-time
- [ ] Multiple teams can play simultaneously
- [ ] Results are persistent across sessions

### ✅ Multi-Device Test
- [ ] Works on desktop browsers
- [ ] Responsive on tablets
- [ ] Functional on mobile devices
- [ ] Cross-browser compatibility

### ✅ Team Coordination
- [ ] Share the deployment URL with instructors
- [ ] Test with multiple browser tabs/windows
- [ ] Verify real-time synchronization
- [ ] Confirm storage persistence

## 🌐 Sharing the Game

### For Instructors:
```
🎮 GovEx Academy Data Governance Game
🔗 URL: [YOUR_DEPLOYMENT_URL]

Instructions for teams:
1. Visit the URL
2. Select your assigned team (1-8)
3. Enter team member names
4. Complete the challenge in 5 minutes
5. View live scoreboard for rankings

Teams: Alpha, Beta, Gamma, Delta, Epsilon, Zeta, Eta, Theta
```

### For Students:
```
🏆 Data Governance Challenge - Week 2

📱 Game Link: [YOUR_DEPLOYMENT_URL]
⏰ Time Limit: 5 minutes
🎯 Goal: Match city scenarios with governance models
🏅 Prize: Badge of the Week for top teams

Select your team and begin!
```

## 🔧 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### Storage Issues
- Clear browser localStorage if needed
- Each deployment URL has separate storage
- Teams must use the same URL to sync

### Performance
- Game loads ~186KB JavaScript + 25KB CSS
- Optimized for fast loading on classroom networks
- Works offline after initial load

## 📊 Monitoring

### Usage Analytics
- Teams active: Check team selection screen
- Completion rate: Monitor scoreboard
- Performance: Browser dev tools

### Instructor Dashboard
- Live scoreboard shows all team progress
- Reset function available for new sessions
- Team status indicators (playing/completed)

## 🔄 Updates

To deploy updates:
1. Make changes locally
2. Test with `npm run build && npm run preview`
3. Commit and push to main branch
4. Deployment will update automatically

---

**Ready to deploy!** 🚀

Choose your deployment method above and share the URL with your teams.