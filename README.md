# 🤖 GitHub Badge Bot

> **The ultimate GitHub achievement hunter.** Set it up once, collect ALL badges automatically.

![Badges Hunted](https://img.shields.io/badge/badges%20hunted-9-brightgreen)
![Runs every hour](https://img.shields.io/badge/schedule-hourly-blue)
![Telegram](https://img.shields.io/badge/notifications-Telegram-26A5E4)
![Free tier](https://img.shields.io/badge/cost-free-success)

---

## 🎯 ALL Badges This Bot Hunts

### 🤖 Fully Automated (set & forget)

| Badge | How | Tier Progress |
|---|---|---|
| ⚡ **Quickdraw** | Opens + closes issue instantly | One-time ✅ |
| 🤙 **YOLO** | Merges PR without review | One-time ✅ |
| 🦈 **Pull Shark** | Auto-creates + merges PRs hourly | 🥉2 → 🥈16 → 🥇128 PRs |
| ❤️ **Heart On Your Sleeve** | Auto-reacts ❤️ to content daily | Beta badge |

### 🔧 Semi-Automated (one-click trigger)

| Badge | How | Tier Progress |
|---|---|---|
| 🔗 **Pair Extraordinaire** | Enter co-author → auto PR+merge | 🥉1 → 🥈10 → 🥇24 PRs |
| 🧠 **Galaxy Brain** | Creates Discussions + reminds you | 🥉1 → 🥈10 → 🥇25 answers |
| 🌐 **Open Sourcerer** | Finds repos + reminds to contribute | Beta badge |

### 📝 Manual (bot guides you with reminders)

| Badge | How | Cost |
|---|---|---|
| ⭐ **Starstruck** | Bot keeps repo fresh + tracks stars | Free (need 16+ stars) |
| 💖 **Public Sponsor** | Bot sends link → sponsor someone $1/mo | $1/month |
| 🏅 **Developer Program** | Bot sends link → sign up (FREE) | Free |

---

## ⚡ Setup (5 minutes)

### Step 1 — Personal Access Token (GH_PAT)

**CRITICAL:** For the badges to be credited to YOUR profile instead of the bot, you must use a Personal Access Token.
1. Go to [Personal Access Tokens (classic)](https://github.com/settings/tokens).
2. Click **Generate new token (classic)**.
3. Check the **`repo`** scope (this gives the bot permission to create PRs and discussions).
4. Generate the token and copy it.
5. Go to your Badge Hunter repository **Settings** → **Secrets and variables** → **Actions**.
6. Add a new repository secret named `GH_PAT` and paste your token.

### Step 2 — Repo Settings

1. Go to **Settings** → **Actions** → **General**
2. **Workflow permissions** → ✅ **Read and write permissions**
3. ✅ **Allow GitHub Actions to create and approve pull requests**
4. **Save**

### Step 3 — Telegram Bot (for live notifications)

1. Open Telegram → search **@BotFather** → `/newbot`
2. Copy the **bot token**
3. Send any message to your new bot, then visit:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
4. Copy your **chat_id** from the response
5. In your repo → **Settings** → **Secrets and variables** → **Actions**:
   - Add secret: `TELEGRAM_BOT_TOKEN` = your bot token
   - Add secret: `TELEGRAM_CHAT_ID` = your chat ID

### Step 4 — Launch! 🚀

Go to **Actions** tab → **Badge Bot Master** → **Run workflow**

That's it. The bot runs every hour automatically and sends Telegram updates.

---

## 📁 Workflow Files

```
.github/workflows/
├── badge-bot.yml              ← 🤖 Master orchestrator (hourly)
├── pull-shark.yml             ← 🦈 Pull Shark + YOLO (hourly)
├── quickdraw.yml              ← ⚡ Quickdraw (auto, once)
├── pair-extraordinaire.yml    ← 🔗 Pair Extraordinaire (manual)
├── galaxy-brain.yml           ← 🧠 Galaxy Brain helper (daily)
├── starstruck.yml             ← ⭐ Starstruck tracker (daily)
├── open-sourcerer.yml         ← 🌐 Open Sourcerer helper (4-hourly)
├── heart-on-sleeve.yml        ← ❤️ Heart On Your Sleeve (daily)
├── public-sponsor.yml         ← 💖 Public Sponsor reminder (weekly)
└── dev-program.yml            ← 🏅 Developer Program reminder (weekly)
```

---

## 📊 Pull Shark Progress Calculator

| Tier | PRs Needed | Time at 1/hr | Time at 24/day |
|---|---|---|---|
| 🥉 Bronze | 2 | ~2 hours | ~2 hours |
| 🥈 Silver | 16 | ~16 hours | ~1 day |
| 🥇 Gold | 128 | ~5 days | ~5 days |

---

## 📱 Telegram Notifications

The bot sends you live updates including:

- 🟢 **Hunt started** — when each cycle begins
- 🦈 **PR progress** — current count & next tier
- 🎉 **Tier unlocks** — instant notification when you reach a new tier
- 📊 **Full reports** — badge dashboard after each hunt
- 💡 **Reminders** — weekly nudges for manual badges

---

## 🔗 Pair Extraordinaire Setup

1. Go to **Actions** → **Pair Extraordinaire Hunter** → **Run workflow**
2. Enter your co-author's GitHub username
3. Enter email: `username@users.noreply.github.com`
4. Set count (up to 10 per run)
5. Click **Run** — it creates + merges co-authored PRs automatically

---

## 🚀 Quick Start Checklist

- [ ] Enable Actions write permissions + PR creation
- [ ] Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets
- [ ] Run **Badge Bot Master** from Actions tab
- [ ] Run **Pair Extraordinaire** with a co-author
- [ ] Run **Galaxy Brain** to set up Discussion tracking
- [ ] Sign up at [developer.github.com/program](https://developer.github.com/program/) (free)
- [ ] Sponsor someone for $1/month at [github.com/sponsors/explore](https://github.com/sponsors/explore)
- [ ] Share repo for ⭐ stars → [r/coolgithubprojects](https://reddit.com/r/coolgithubprojects)
- [ ] Check badges at: `https://github.com/YOUR_USERNAME`

---

## 💡 Pro Tips

- Badges take **minutes to hours** to appear after the trigger action
- **Pull Shark Gold** (128 PRs) takes ~5 days with hourly runs — be patient
- For **Pair Extraordinaire**, use a friend's noreply email: `username@users.noreply.github.com`
- **Galaxy Brain** requires REAL answers — go answer questions in popular repos
- Run **Pair Extraordinaire** with count=10 to batch create co-authored PRs
- Telegram is optional but recommended — you'll know exactly when badges unlock

---

*Last updated: 2026-06-26 · ⭐ 0 stars · Badge Bot 🤖*
