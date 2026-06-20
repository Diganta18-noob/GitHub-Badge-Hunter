# 🤖 GitHub Badge Bot

> Fully automated GitHub achievement hunter. Set it up once, collect badges forever.

![Badges Hunted](https://img.shields.io/badge/badges%20hunted-auto-brightgreen)
![Runs every hour](https://img.shields.io/badge/schedule-hourly-blue)
![Free tier](https://img.shields.io/badge/cost-free-success)

---

## 🎯 Badges This Bot Hunts

| Badge | Tier | Status |
|---|---|---|
| ⚡ **Quickdraw** | One-time | Auto-triggered |
| 🦈 **Pull Shark** | Bronze→Gold | Runs every hour |
| 🤙 **YOLO** | One-time | Auto with Pull Shark |
| 🔗 **Pair Extraordinaire** | Bronze→Gold | Manual trigger |
| 🧠 **Galaxy Brain** | Bronze→Gold | Semi-manual helper |

---

## ⚡ Setup (5 minutes)

### Step 1 — Create the repo

1. Go to [github.com/new](https://github.com/new)
2. Name: `badge-bot` | Visibility: **Public**
3. ✅ Add a README
4. Create repository

### Step 2 — Enable Actions permissions

`Settings` → `Actions` → `General` → `Workflow permissions`
- ✅ **Read and write permissions**
- ✅ **Allow GitHub Actions to create and approve pull requests**
- Save

### Step 3 — Add all workflow files

Upload or create these files in `.github/workflows/`:

```
.github/workflows/
├── badge-bot.yml           ← master orchestrator (hourly)
├── pull-shark.yml          ← Pull Shark + YOLO
├── quickdraw.yml           ← Quickdraw
├── pair-extraordinaire.yml ← Pair Extraordinaire
├── galaxy-brain.yml        ← Galaxy Brain helper
└── starstruck.yml          ← keeps repo fresh for stars
```

### Step 4 — Run it!

Go to **Actions** tab → select **"Badge Bot Master"** → click **"Run workflow"**

That's it. The bot will now run every hour automatically.

---

## 📊 Pull Shark Progress

| Tier | PRs Needed | Time at 1/hr |
|---|---|---|
| 🥉 Bronze | 2 | ~2 hours |
| 🥈 Silver | 16 | ~16 hours |
| 🥇 Gold | 128 | ~5 days |

---

## 🔗 Pair Extraordinaire Setup

1. Go to Actions → **Pair Extraordinaire Hunter** → Run workflow
2. Enter your co-author's GitHub username
3. Email format: `username@users.noreply.github.com`

Or edit `pair-extraordinaire.yml` to hardcode your co-author's details.

---

## 🧠 Galaxy Brain Setup

1. Find a repo with a **Discussions** tab
2. Answer an open question well
3. Ask the repo owner to mark it as the accepted answer
4. Alternatively: use the `galaxy-brain.yml` workflow to post answers programmatically

---

## ⭐ Starstruck Tips

The bot auto-updates your README daily to keep the repo fresh. To get stars:
- Share on **Reddit** ([r/coolgithubprojects](https://reddit.com/r/coolgithubprojects), [r/github](https://reddit.com/r/github))
- Post on **dev.to** or **Hashnode**
- Share on **Twitter/X** with #github #opensource

---

*Last updated: auto*
