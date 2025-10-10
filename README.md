# Data Governance Game - Week 4: Equity in Action

An interactive learning experience that challenges participants to make data governance decisions through equity-focused scenarios with real-time AI feedback.

## 🎯 Features

### Two Complete Scenarios
- **City of Saturn**: Beach tourism vs climate resilience with equity considerations
- **City of Mercury**: Suburban infrastructure prioritization with demographic analysis

### AI-Powered Learning
- **Real-time feedback** from Claude AI on all responses
- **4-category scoring system**: Completeness (25%), Equity Focus (35%), Systems Thinking (25%), Data Awareness (15%)
- **Comprehensive analysis** with personalized insights on final reflection screen

### Interactive Elements
- **Timed questions** with auto-submission
- **Drag-and-drop ranking** for infrastructure prioritization
- **Demographics visualization** for decision-making context
- **Cross-device scoring** via Supabase for team collaboration

### Enhanced Dashboard
- **Spider chart** visualization of skill development
- **Badge system** (Equity Champion/Aware/Learner)
- **Scenario comparison** bars
- **Completion certificates** with timestamps

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Claude API key from [console.anthropic.com](https://console.anthropic.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/galvaro94/Implementing-Data-Governance-Game-Week-2.git
   cd "GovEx Academy Game - DM1 2025"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   echo "VITE_CLAUDE_API_KEY=your_api_key_here" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000/Implementing-Data-Governance-Game-Week-2/`

## 🎮 How to Play

1. **Select Week 4** from the main menu
2. **Complete City of Saturn scenario** (3.5 minutes)
   - Answer equity-focused questions about tourism vs climate resilience
   - Receive AI feedback on each response
3. **Complete City of Mercury scenario** (3.5 minutes)
   - Answer data governance questions
   - Rank infrastructure priorities using drag-and-drop
4. **View comprehensive analysis** with AI-generated insights
5. **Explore enhanced dashboard** with skill breakdown and badges

## 🏗️ Technical Architecture

### Frontend
- **React 18** with hooks-based state management
- **Vite** for fast development and building
- **Native HTML5 drag-and-drop** for ranking interface

### AI Integration
- **Claude API** for real-time feedback and comprehensive analysis
- **Structured prompting** for consistent 4-category scoring
- **Graceful error handling** with meaningful fallbacks

### Data Persistence
- **Supabase** for cross-device score synchronization
- **localStorage** for local backup and reliability
- **Real-time polling** for immediate updates

## 🔧 Configuration

### Environment Variables
- `VITE_CLAUDE_API_KEY`: Your Claude API key for AI feedback

### Supabase Configuration
The game uses a pre-configured Supabase instance for cross-device functionality. To use your own:

1. Create a Supabase project
2. Update credentials in `src/supabaseStorage.js`
3. Create `game_sessions` table with required schema

## 🌍 Multi-language Support

The game framework supports English, Spanish, and Portuguese with language switching capabilities.

## 📊 Scoring System

### Category Weights
- **Completeness**: 25% - How thoroughly participants address questions
- **Equity Focus**: 35% - Consideration of marginalized communities and fairness
- **Systems Thinking**: 25% - Understanding connections and broader implications
- **Data Awareness**: 15% - Grasp of data governance principles

### Badge Levels
- **Equity Champion**: 80%+ equity-focused score
- **Equity Aware**: 60-79% equity-focused score
- **Equity Learner**: Below 60% equity-focused score

## 🤝 Contributing

This project was developed for the GovEx Academy Data Governance program. Contributions and improvements are welcome.

## 📄 License

Educational use for data governance training programs.

## 🔗 Related

- Week 2 game features basic scenarios and cross-device scoring
- Built with accessibility and educational effectiveness in mind
- Designed for cohort-based learning with real-time collaboration

---

**Ready to explore data governance through equity-focused decision making!** 🚀
