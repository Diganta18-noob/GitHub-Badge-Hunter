# Requirements Document

## Introduction

GitHub Badge Tracker is a production-ready web application that allows any user to enter a GitHub username or profile URL and receive a comprehensive, visually rich analysis of their GitHub achievement badges. The application fetches data from GitHub's REST API, GraphQL API, and Public Events API to compute badge progress, predict the next badge to unlock, generate a personalized AI-driven roadmap, and surface comparative leaderboard data — all presented in a clean editorial interface inspired by Linear, Vercel, and the Kolkata Travel Router design system.

## Glossary

- **Tracker**: The GitHub Badge Tracker web application
- **Analyzer**: The subsystem responsible for fetching, normalizing, and caching all GitHub data for a given user
- **Badge_Engine**: The subsystem that maps raw GitHub metrics to badge unlock states, tiers, progress percentages, and rarity classifications
- **Roadmap_Engine**: The subsystem that generates a personalized, step-by-step unlock roadmap ordered by estimated effort and days
- **Timeline**: The chronological visual display of earned badges grouped by year
- **Compare_View**: The side-by-side comparison panel for two GitHub users
- **Leaderboard**: The ranked table of users by badge count, growth rate, contributions, and pull-request volume
- **Search_History**: The client-side store of recently searched profiles, favorites, and bookmarked profiles
- **Share_Service**: The subsystem that generates shareable cards, social media images, and downloadable reports
- **Score_Engine**: The subsystem that computes GitHub Score and Open Source Score from weighted metrics
- **GitHub_REST_API**: GitHub's v3 REST API at `https://api.github.com`
- **GitHub_GraphQL_API**: GitHub's v4 GraphQL API at `https://api.github.com/graphql`
- **GitHub_Events_API**: GitHub's public events endpoint at `https://api.github.com/users/{username}/events/public`
- **Badge**: A GitHub achievement with a name, description, icon, tier (Bronze / Silver / Gold), rarity class, and unlock criteria
- **Tier**: One of Bronze, Silver, Gold — representing the level of a repeatable badge
- **Rarity**: One of Common, Rare, Epic, Legendary, Secret — representing badge exclusivity
- **Progress_Bar**: A visual indicator showing the ratio of a user's current metric value to the badge unlock threshold
- **Skeleton**: A placeholder UI element shown while data is loading

---

## Requirements

### Requirement 1: Profile Input and Parsing

**User Story:** As a visitor, I want to paste a full GitHub profile URL or just a username, so that I can start analyzing any profile without remembering the exact format.

#### Acceptance Criteria

1. THE Tracker SHALL accept input in the format `https://github.com/{username}`, `github.com/{username}`, or a bare `{username}` string in the search field.
2. WHEN a user submits input containing a full URL, THE Tracker SHALL extract the username segment and discard the URL prefix before passing the value to the Analyzer.
3. WHEN a user submits an empty string, THE Tracker SHALL display an inline validation message reading "Please enter a GitHub username or profile URL" without invoking the Analyzer.
4. WHEN a user submits a string that contains characters outside the set `[a-zA-Z0-9\-]` after URL extraction, THE Tracker SHALL display an inline validation message reading "Invalid GitHub username format" without invoking the Analyzer.
5. THE Tracker SHALL debounce input field keystrokes with a 300 ms delay before triggering autocomplete suggestions from Search_History.
6. WHEN a user selects a Search_History entry from the autocomplete dropdown, THE Tracker SHALL populate the input field with the stored username and immediately trigger analysis.

---

### Requirement 2: GitHub Data Fetching

**User Story:** As a visitor, I want the Tracker to retrieve all publicly available GitHub data for a username, so that badge progress calculations are accurate and complete.

#### Acceptance Criteria

1. WHEN the user clicks "Analyze Profile", THE Analyzer SHALL fetch user profile metadata (avatar, name, username, bio, account creation date, followers, following, public repository count) from the GitHub_REST_API endpoint `GET /users/{username}`.
2. WHEN the user clicks "Analyze Profile", THE Analyzer SHALL fetch aggregated contribution statistics (total commits, total pull requests, total issues, total discussions, total gists, total packages, starred repository count, fork count) from the GitHub_GraphQL_API using the `contributionsCollection` and `repositories` nodes.
3. WHEN the user clicks "Analyze Profile", THE Analyzer SHALL fetch up to 300 recent public events from the GitHub_Events_API to derive activity heatmap data and recent contribution streaks.
4. WHEN the user clicks "Analyze Profile", THE Analyzer SHALL fetch the user's organization memberships from `GET /users/{username}/orgs`.
5. WHEN the user clicks "Analyze Profile", THE Analyzer SHALL fetch the user's language distribution by aggregating `language` fields across all public repositories via the GitHub_GraphQL_API.
6. THE Analyzer SHALL execute the REST, GraphQL, and Events API calls concurrently to minimize total fetch latency.
7. WHEN a GitHub_REST_API, GitHub_GraphQL_API, or GitHub_Events_API call returns an HTTP 404 status, THE Analyzer SHALL surface an error state with the message "GitHub user not found. Please check the username and try again."
8. WHEN a GitHub_REST_API, GitHub_GraphQL_API, or GitHub_Events_API call returns an HTTP 403 or 429 status, THE Analyzer SHALL surface an error state with the message "GitHub API rate limit reached. Please wait a few minutes and try again."
9. THE Analyzer SHALL cache all fetched data for a given username in the browser's in-memory store with a time-to-live of 5 minutes to prevent redundant API calls within a session.
10. WHILE data is being fetched, THE Tracker SHALL display a Skeleton layout matching the shape of each result section.

---

### Requirement 3: Profile Display

**User Story:** As a visitor, I want to see a clear profile summary after analysis, so that I can confirm I'm viewing the correct user's data.

#### Acceptance Criteria

1. WHEN the Analyzer returns a successful response, THE Tracker SHALL display the user's avatar image, full name, username prefixed with `@`, bio text, and account age computed as the number of complete years between account creation date and the current date.
2. THE Tracker SHALL display numeric statistics — followers, following, public repositories, total stars received, total commits, total pull requests, total issues, total organizations, and total gists — using a monospace typeface.
3. WHEN a numeric statistic exceeds 999, THE Tracker SHALL format it with comma separators (e.g., `1,234`).
4. WHEN a numeric statistic counter first renders after data load, THE Tracker SHALL animate it from 0 to its final value over a duration of 800 ms using an ease-out curve.
5. THE Tracker SHALL display a language distribution chart showing the top 8 languages by percentage of total bytes contributed across all public repositories.

---

### Requirement 4: Badge Calculation and Display

**User Story:** As a visitor, I want to see every GitHub achievement badge with my current unlock status and progress, so that I know exactly which badges I have and which I still need to earn.

#### Acceptance Criteria

1. THE Badge_Engine SHALL evaluate the following badges against the fetched metrics: Pair Extraordinaire, Quickdraw, YOLO, Galaxy Brain, Pull Shark, Arctic Code Vault, Starstruck, Public Sponsor, Mars 2020 Helicopter Contributor, Developer Program Member, Open Source Contributor (Heart on Your Sleeve), Achievement Hunter, Early Adopter, and all currently active secret badges.
2. FOR EACH badge, THE Badge_Engine SHALL compute a progress value as the ratio of the user's current qualifying metric to the threshold required for the next unlock tier, expressed as a percentage clamped between 0 and 100.
3. WHEN a badge's progress value equals 100, THE Badge_Engine SHALL mark the badge as Unlocked and record the qualifying date if derivable from event data.
4. FOR EACH badge, THE Badge_Engine SHALL assign a rarity class: Common (Quickdraw, YOLO, Early Adopter), Rare (Pull Shark Bronze, Starstruck Bronze, Pair Extraordinaire Bronze), Epic (Pull Shark Silver/Gold, Starstruck Silver/Gold, Galaxy Brain, Pair Extraordinaire Silver/Gold), Legendary (Arctic Code Vault, Mars 2020, Public Sponsor), Secret (any badge with undisclosed unlock criteria).
5. THE Tracker SHALL render each badge as a card containing: the badge icon, badge name, description, current tier label, Progress_Bar filled to the computed percentage, Unlocked or Locked status indicator, earned date (if unlocked), difficulty label, and rarity label.
6. WHEN a badge is Unlocked, THE Tracker SHALL display the badge card with full color saturation and a green checkmark indicator.
7. WHEN a badge is Locked, THE Tracker SHALL display the badge card with reduced opacity and a grey lock icon.
8. WHEN a badge card first enters the viewport, THE Tracker SHALL animate it in using a fade-and-translate-up transition with a 200 ms duration.
9. THE Tracker SHALL group badge cards into two sections: "Unlocked Badges" and "Locked Badges", displayed in that order.
10. WHEN a user hovers over a badge card on a pointer device, THE Tracker SHALL apply a subtle lift shadow transition with a 150 ms duration.

---

### Requirement 5: Rarity System with Animated Indicators

**User Story:** As a visitor, I want badges to visually communicate how rare they are, so that I can appreciate the exclusivity of my earned achievements.

#### Acceptance Criteria

1. THE Badge_Engine SHALL assign each badge exactly one rarity class from the set: Common, Rare, Epic, Legendary, Secret.
2. THE Tracker SHALL render a rarity indicator on each badge card using the following colors: Common — `#6B7280`, Rare — `#2563EB`, Epic — `#7C3AED`, Legendary — `#F59E0B`, Secret — `#0F172A` with a pulsing glow animation.
3. WHEN a badge has rarity class Secret, THE Tracker SHALL apply a continuous pulsing glow animation with a 2-second period to the badge card border.
4. WHEN a badge has rarity class Legendary, THE Tracker SHALL apply a shimmer sweep animation across the badge icon at a 3-second interval.
5. THE Statistics Panel SHALL display the count of Rare-or-above badges separately under the label "Rare Badges" and the count of Secret badges under "Secret Badges".

---

### Requirement 6: Next Badge Recommendation

**User Story:** As a visitor, I want the Tracker to identify the badge I'm closest to unlocking next, so that I can focus my GitHub activity on the highest-impact actions.

#### Acceptance Criteria

1. AFTER the Badge_Engine completes evaluation, THE Roadmap_Engine SHALL identify the single Locked badge with the highest computed progress percentage as the "Next Badge".
2. THE Tracker SHALL display the Next Badge in a dedicated card showing: badge icon, badge name, current metric value and threshold (e.g., "6 / 8 merged pull requests"), remaining metric gap (e.g., "2 more merged PRs needed"), difficulty label, and estimated days to unlock.
3. THE Roadmap_Engine SHALL compute estimated days to unlock the Next Badge based on the user's average daily activity rate for the relevant metric derived from the GitHub_Events_API data, using a rolling 90-day window.
4. WHEN the user has fewer than 10 events in the 90-day window, THE Roadmap_Engine SHALL display "Estimated time: depends on your activity" instead of a specific day count.
5. THE Tracker SHALL display a requirements checklist for the Next Badge where each checklist item is either checked (criterion met) or unchecked (criterion not yet met).
6. THE Tracker SHALL display a Progress_Bar within the Next Badge card filled to the badge's current progress percentage.

---

### Requirement 7: Badge Requirements Checklist

**User Story:** As a visitor, I want a detailed checklist for every badge, so that I know exactly which sub-criteria I've met and which remain.

#### Acceptance Criteria

1. FOR EACH badge, THE Badge_Engine SHALL define a set of one or more verifiable checklist items derived from the badge's official unlock criteria.
2. THE Tracker SHALL render the checklist for a badge within its card as a vertical list of items, each prefixed with a checked or unchecked icon based on whether the user's fetched data satisfies that item.
3. THE Tracker SHALL display the overall completion percentage of a badge's checklist in the format "N% complete" adjacent to the checklist.
4. WHEN all checklist items for a badge are checked, THE Tracker SHALL trigger a confetti burst animation centered on that badge card.

---

### Requirement 8: AI Roadmap

**User Story:** As a visitor, I want a personalized step-by-step roadmap showing how to unlock my next N badges, so that I can plan my GitHub activity efficiently.

#### Acceptance Criteria

1. THE Roadmap_Engine SHALL generate an ordered list of up to 10 action steps targeting the top 3 Locked badges with the highest progress percentages.
2. EACH roadmap step SHALL include: a plain-language action description (e.g., "Star 10 repositories in the next 7 days"), the target badge it contributes to, an estimated number of days to complete, and a difficulty label (Easy / Medium / Hard).
3. THE Roadmap_Engine SHALL order steps such that the step with the shortest estimated completion days appears first.
4. THE Tracker SHALL render each roadmap step as a numbered card in a vertical list with a connecting visual line between consecutive steps.
5. WHEN the user completes a roadmap step (detectable via re-analysis), THE Tracker SHALL mark the step as completed with a green checkmark and strike-through text.
6. THE Tracker SHALL display the total estimated time to complete the full roadmap as a sum of all step estimates below the last step.

---

### Requirement 9: Badge Timeline

**User Story:** As a visitor, I want a visual timeline of when I earned each badge, so that I can see how my GitHub journey has progressed over time.

#### Acceptance Criteria

1. THE Tracker SHALL render a vertical timeline component that groups earned badges by calendar year, with the most recent year displayed at the top.
2. EACH timeline entry SHALL display the badge icon, badge name, tier label, and the derived or estimated unlock date.
3. IF a badge's exact unlock date cannot be derived from event data, THE Tracker SHALL display "Date not available" in place of the date.
4. THE Tracker SHALL render an "Upcoming Badges" subsection below the earned timeline showing the top 3 Locked badges ordered by highest progress percentage, each with the estimated unlock date range computed by the Roadmap_Engine.
5. WHEN a timeline year group first scrolls into the viewport, THE Tracker SHALL animate it in using a fade-and-slide-left transition with a 300 ms duration.

---

### Requirement 10: Statistics Panel

**User Story:** As a visitor, I want a high-level statistics panel summarising my badge and GitHub activity metrics, so that I can quickly assess my overall standing.

#### Acceptance Criteria

1. THE Score_Engine SHALL compute a GitHub Score as a weighted sum: (commits × 1) + (pull_requests × 3) + (issues × 2) + (stars_received × 2) + (followers × 1) + (organizations × 5), clamped to a maximum display value of 10,000.
2. THE Score_Engine SHALL compute an Open Source Score as a weighted sum: (merged_prs_on_external_repos × 5) + (forks_received × 3) + (contributors_to_user_repos × 2), clamped to a maximum display value of 10,000.
3. THE Tracker SHALL display the following statistics in the Statistics Panel: Total Badges evaluated, Unlocked count, Locked count, Rare Badges count, Secret Badges count, Progress Percentage (unlocked / total × 100 rounded to one decimal), Estimated Completion date, GitHub Score, and Open Source Score.
4. WHEN the Statistics Panel first renders, THE Tracker SHALL animate each numeric value from 0 to its final value over 800 ms using an ease-out curve.
5. THE Tracker SHALL display the Estimated Completion date as the calendar date computed by adding the total Roadmap_Engine estimated days to the current date.

---

### Requirement 11: Compare Mode

**User Story:** As a visitor, I want to compare two GitHub users side by side, so that I can benchmark my badge progress and GitHub activity against a peer.

#### Acceptance Criteria

1. THE Tracker SHALL provide a Compare Mode entry point that allows the user to enter a second GitHub username.
2. WHEN the user initiates Compare Mode, THE Analyzer SHALL fetch all profile data for both usernames concurrently using the same data fetching logic defined in Requirement 2.
3. THE Tracker SHALL render both profiles side by side in a two-column grid on viewports ≥ 768 px wide, and in a stacked single-column layout on viewports < 768 px wide.
4. THE Compare_View SHALL display the following metrics in parallel rows for both users: total badges unlocked, total stars received, public repository count, follower count, total pull requests, total commits, top 5 languages, total contributions in the last year, and recent activity frequency.
5. THE Compare_View SHALL visually highlight the higher value in each row using the accent color `#15803D` and the lower value using the default text color.
6. THE Compare_View SHALL display a badge-by-badge comparison table where each row names a badge and shows Unlocked, Locked, or In Progress for each user.

---

### Requirement 12: Leaderboard

**User Story:** As a visitor, I want to see a leaderboard of top GitHub users by badge count and contribution metrics, so that I can discover high-achieving profiles and gauge my standing.

#### Acceptance Criteria

1. THE Tracker SHALL maintain a client-side leaderboard populated from profiles analyzed during the current browser session plus any profiles stored in Search_History favorites.
2. THE Leaderboard SHALL rank entries across four tabs: "Most Badges", "Fastest Growth" (badges unlocked in the last 30 days), "Most Contributions" (total commits + PRs + issues), and "Most PRs" (total pull requests).
3. EACH leaderboard row SHALL display: rank number, user avatar, username, the metric value for the active tab, and a trend indicator (up / down / new).
4. THE Tracker SHALL update the leaderboard rankings in real time whenever a new profile is successfully analyzed within the same session.
5. WHEN the leaderboard contains fewer than 3 entries, THE Tracker SHALL display a placeholder message: "Analyze more profiles to populate the leaderboard."

---

### Requirement 13: Search History, Favorites, and Bookmarks

**User Story:** As a returning visitor, I want my recent searches, favorite profiles, and bookmarked profiles to persist across sessions, so that I can quickly re-analyze profiles I care about.

#### Acceptance Criteria

1. THE Search_History SHALL persist up to 20 most recently analyzed usernames in the browser's `localStorage` under the key `gbt_search_history`, ordered by most recent first.
2. WHEN a username is analyzed, THE Search_History SHALL prepend the username to the stored list, deduplicate by username, and trim the list to 20 entries.
3. THE Tracker SHALL render the Search_History as a dropdown list below the search input, visible when the input is focused and the history is non-empty.
4. THE Tracker SHALL provide a star icon on each analyzed profile that, when clicked, adds the username to a favorites list persisted in `localStorage` under the key `gbt_favorites` with no size limit.
5. THE Tracker SHALL provide a bookmark icon on each analyzed profile that, when clicked, saves the full analyzed data snapshot to `localStorage` under the key `gbt_bookmarks` keyed by username, enabling offline review of the last-fetched data.
6. WHEN a bookmarked profile is loaded from `localStorage`, THE Tracker SHALL display a "Cached — last updated {date}" banner above the profile to indicate the data is not live.

---

### Requirement 14: Share Features

**User Story:** As a visitor, I want to share my badge progress on social media or download a report, so that I can showcase my GitHub achievements publicly.

#### Acceptance Criteria

1. THE Share_Service SHALL generate a share card image (1200 × 630 px) containing the user's avatar, name, total badges unlocked, top 3 badges, GitHub Score, and the Tracker's branding, using HTML Canvas or a server-rendered image endpoint.
2. THE Share_Service SHALL generate a Twitter-optimized image (1200 × 600 px) and a LinkedIn-optimized image (1200 × 627 px) with the same content layout adapted to each platform's recommended proportions.
3. THE Tracker SHALL provide a "Download PNG" button that triggers a browser download of the share card as a `.png` file named `{username}-github-badges.png`.
4. THE Tracker SHALL provide a "Download PDF" button that triggers a browser download of a paginated PDF report containing the full profile, all badge cards, the roadmap, and the timeline, named `{username}-github-badge-report.pdf`.
5. THE Tracker SHALL provide a "Copy Share Link" button that writes to the clipboard a URL in the format `https://{tracker-domain}/u/{username}` which, when visited, auto-triggers analysis for that username.
6. WHEN the share card is generated, THE Tracker SHALL display it in a modal preview before offering the download or copy options.

---

### Requirement 15: Animations and Loading States

**User Story:** As a visitor, I want smooth, purposeful animations and clear loading feedback, so that the interface feels polished and I always know when data is being fetched.

#### Acceptance Criteria

1. WHILE the Analyzer is fetching data, THE Tracker SHALL display Skeleton elements in place of each result section, matching the approximate height and column structure of the loaded content.
2. WHEN a badge transitions from Locked to Unlocked during a re-analysis, THE Tracker SHALL play an achievement unlock animation consisting of a radial glow pulse followed by a confetti burst lasting 1.5 seconds.
3. WHEN a Progress_Bar first renders, THE Tracker SHALL animate its fill from 0% to the final value over 600 ms using an ease-out curve.
4. WHEN numeric counter values first render in the Profile Display or Statistics Panel, THE Tracker SHALL animate them from 0 to their final value over 800 ms using an ease-out curve.
5. WHEN the page first loads, THE Tracker SHALL animate the hero section heading and subheading into view using a staggered fade-and-slide-up transition, with the heading appearing 0 ms after mount and the subheading appearing 150 ms after mount.
6. IF a user has set `prefers-reduced-motion: reduce` in their OS accessibility settings, THE Tracker SHALL suppress all non-essential animations and display final states immediately.

---

### Requirement 16: Responsive Layout

**User Story:** As a visitor on any device, I want the layout to adapt cleanly to my screen size without horizontal scrolling, so that I can use the Tracker on mobile, tablet, and desktop.

#### Acceptance Criteria

1. THE Tracker SHALL render without horizontal scrolling at viewport widths from 320 px to 3840 px.
2. THE Tracker SHALL use a single-column layout for viewport widths < 640 px, a two-column layout for widths 640 px – 1023 px, and a three-or-more-column layout for widths ≥ 1024 px.
3. THE Tracker SHALL ensure all interactive touch targets have a minimum size of 44 × 44 px on viewport widths < 768 px.
4. THE Tracker SHALL render the navigation as a collapsible hamburger menu on viewport widths < 768 px.
5. THE Compare_View SHALL transition from a two-column to a single-column stacked layout at viewport widths < 768 px.

---

### Requirement 17: Performance

**User Story:** As a visitor, I want the page to load quickly and remain responsive while fetching data, so that I don't experience delays that interrupt my workflow.

#### Acceptance Criteria

1. THE Tracker SHALL achieve a Largest Contentful Paint (LCP) of ≤ 2.5 seconds on a simulated 4G connection (10 Mbps download, 75 ms RTT) for the initial page load with no GitHub data fetched.
2. THE Tracker SHALL lazy-load all badge card images and chart components that are below the initial viewport fold using the browser's native `loading="lazy"` attribute or dynamic import where applicable.
3. THE Analyzer SHALL de-duplicate concurrent requests for the same username within the same 5-minute cache window, ensuring at most one active in-flight request per username at any time.
4. THE Tracker SHALL use React Query's stale-while-revalidate strategy so that cached profile data is shown immediately on re-analysis while a background refresh runs silently.
5. THE Tracker SHALL split the Compare_View, Leaderboard, Share_Service, and PDF generation modules as separate dynamic import chunks loaded only when first accessed.

---

### Requirement 18: SEO and Meta

**User Story:** As a site owner, I want the Tracker to be properly indexed and shareable, so that it attracts organic traffic and produces rich social previews when shared.

#### Acceptance Criteria

1. THE Tracker SHALL render a `<title>` tag on the root page with the value "GitHub Badge Tracker — Track your GitHub achievements and unlock your next badge."
2. THE Tracker SHALL render Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:url`) on the root page and on each `/u/{username}` route.
3. THE Tracker SHALL render Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) on all pages.
4. THE Tracker SHALL render a JSON-LD structured data block of type `WebApplication` on the root page.
5. THE Tracker SHALL generate a `sitemap.xml` listing the root URL and each `/u/{username}` route for analyzed profiles, regenerated on each deployment.
6. THE Tracker SHALL render a `robots.txt` file that permits all crawlers to index all routes.

---

### Requirement 19: Accessibility

**User Story:** As a visitor using assistive technology, I want the Tracker to be navigable and understandable via keyboard and screen reader, so that my experience is equivalent to that of non-assistive-technology users.

#### Acceptance Criteria

1. THE Tracker SHALL achieve a WCAG 2.1 Level AA conformance target for all interactive components.
2. THE Tracker SHALL provide a visible focus ring with a minimum 2 px outline on all focusable elements.
3. THE Tracker SHALL assign `aria-label` attributes to all icon-only buttons, providing a text description of the button's action.
4. THE Tracker SHALL associate all form inputs with a `<label>` element or `aria-label` attribute.
5. WHEN the Analyzer returns an error, THE Tracker SHALL announce the error message via an `aria-live="polite"` region so screen readers surface the message without interrupting ongoing speech.
6. ALL images SHALL include a meaningful `alt` attribute; decorative images SHALL use `alt=""`.
7. THE Tracker SHALL maintain a color contrast ratio of ≥ 4.5:1 for all normal text and ≥ 3:1 for large text and UI components, measured against the background colors specified in the design system.

---

### Requirement 20: Bonus Features

**User Story:** As an engaged visitor, I want access to extended features that deepen my understanding of my GitHub activity and gamify my progress, so that I stay motivated to contribute to open source.

#### Acceptance Criteria

1. THE Tracker SHALL provide a "GitHub Wrapped" view that summarizes the user's GitHub activity for the current calendar year, including top language, most active month, total contributions, and badges earned that year.
2. THE Tracker SHALL provide a "Badge Predictor" that, given the user's current trajectory, outputs a list of badges likely to be unlocked within the next 90 days with probability scores.
3. THE Tracker SHALL provide a "Weekly Challenge" widget showing one recommended action per week that advances the user's badge progress, refreshed every Monday at 00:00 UTC.
4. THE Tracker SHALL provide a "Contribution Streak Tracker" that displays the user's current contribution streak in days and the longest streak on record, derived from GitHub_Events_API data.
5. THE Tracker SHALL provide a "Repository Health Score" for each of the user's public repositories, computed as a weighted score of: has README (20 pts), has LICENSE (20 pts), has contributing guide (20 pts), has open issues (10 pts), has recent commit within 90 days (30 pts).
6. THE Tracker SHALL provide a "Hacktoberfest Tracker" that counts the user's qualifying pull requests submitted during October of the current year and displays progress toward the 4-PR Hacktoberfest completion threshold.
7. THE Tracker SHALL provide an "Open Source Recommendations" panel that suggests up to 5 public repositories matching the user's top languages and accepting "good first issue" contributions, sourced via the GitHub_REST_API `GET /search/repositories` endpoint.
8. THE Tracker SHALL provide a "GitHub RPG Mode" toggle that re-labels badge tiers as RPG ranks (Bronze → Apprentice, Silver → Journeyman, Gold → Master) and renders XP bars in place of Progress_Bars, while preserving all underlying data.
9. THE Tracker SHALL provide a "Contribution Calendar Replay" animation that plays back the user's contribution heatmap month by month using the contribution data from the GitHub_GraphQL_API `contributionsCollection`.
10. THE Tracker SHALL provide an "Achievement Notifications" opt-in that, when enabled, uses the browser Notifications API to alert the user when a re-analysis detects a newly unlocked badge.
