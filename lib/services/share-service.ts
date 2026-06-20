import type { GitHubProfile, BadgeEvaluation, ScoreResult, RoadmapResult } from '@/types';

// Helper to load image asynchronously in the browser with anonymous CORS configuration
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback: resolve an empty image to prevent crash
      const fallbackImg = new window.Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = reject;
      fallbackImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
    };
    img.src = src;
  });
}

/**
 * Draws the share card on a canvas element based on dimensions.
 */
async function drawCardOnCanvas(
  width: number,
  height: number,
  profile: GitHubProfile,
  evaluations: BadgeEvaluation[],
  scores: ScoreResult
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Background
  ctx.fillStyle = '#F7F9F6';
  ctx.fillRect(0, 0, width, height);

  // 2. Decorative background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, 'rgba(31, 111, 74, 0.04)');
  grad.addColorStop(1, '#F7F9F6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 3. Avatar
  try {
    const avatar = await loadImage(profile.avatarUrl);
    // Draw rounded avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(60 + 60, 60 + 60, 60, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 60, 60, 120, 120);
    ctx.restore();

    // Draw ink outline around avatar
    ctx.strokeStyle = '#16211a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(60 + 60, 60 + 60, 60, 0, Math.PI * 2, true);
    ctx.stroke();
  } catch {
    // Graceful fallback if avatar fails
    ctx.fillStyle = '#EEF4EC';
    ctx.fillRect(60, 60, 120, 120);
    ctx.strokeStyle = '#16211a';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 60, 120, 120);
  }

  // 4. Name & Username
  ctx.fillStyle = '#16211a';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(profile.name || profile.username, 200, 110);
  ctx.fillStyle = '#1f6f4a';
  ctx.font = '24px sans-serif';
  ctx.fillText(`@${profile.username}`, 200, 150);

  // 5. Badge stats
  const unlocked = evaluations.filter((e) => e.status === 'Unlocked').length;
  ctx.fillStyle = '#16211a';
  ctx.font = 'bold 72px sans-serif';
  ctx.fillText(String(unlocked), 60, 310);
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#4f6156';
  ctx.fillText('badges unlocked', 60, 350);

  // 6. Draw Top 3 Badge Icons
  const top3 = evaluations.filter((e) => e.status === 'Unlocked').slice(0, 3);
  for (let i = 0; i < top3.length; i++) {
    try {
      const badgeIcon = await loadImage(top3[i].definition.iconPath);
      ctx.drawImage(badgeIcon, 60 + i * 110, 380, 80, 80);
      // Draw ink border around icons
      ctx.strokeStyle = '#16211a';
      ctx.lineWidth = 2;
      ctx.strokeRect(60 + i * 110, 380, 80, 80);
    } catch {
      // Draw placeholder star if icon fails
      ctx.fillStyle = '#1f6f4a';
      ctx.font = '40px sans-serif';
      ctx.fillText('🏆', 60 + i * 110 + 20, 430);
    }
  }

  // 7. Scores
  ctx.fillStyle = '#4f6156';
  ctx.font = '22px sans-serif';
  ctx.fillText('GitHub Score', width - 260, 110);
  ctx.fillStyle = '#1f6f4a';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(scores.githubScore.toLocaleString(), width - 260, 150);

  ctx.fillStyle = '#4f6156';
  ctx.font = '22px sans-serif';
  ctx.fillText('Open Source Score', width - 260, 230);
  ctx.fillStyle = '#0f5c78';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(scores.openSourceScore.toLocaleString(), width - 260, 270);

  // 8. Branding
  ctx.strokeStyle = '#cbd8cf';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, height - 80);
  ctx.lineTo(width - 60, height - 80);
  ctx.stroke();

  ctx.fillStyle = '#4f6156';
  ctx.font = '18px sans-serif';
  ctx.fillText('githubbadgetracker.com', 60, height - 40);

  return canvas;
}

export async function generateShareCardCanvas(
  profile: GitHubProfile,
  evaluations: BadgeEvaluation[],
  scores: ScoreResult
): Promise<Blob> {
  const canvas = await drawCardOnCanvas(1200, 630, profile, evaluations, scores);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}

export async function generateTwitterCard(
  profile: GitHubProfile,
  evaluations: BadgeEvaluation[],
  scores: ScoreResult
): Promise<Blob> {
  const canvas = await drawCardOnCanvas(1200, 600, profile, evaluations, scores);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}

export async function generateLinkedInCard(
  profile: GitHubProfile,
  evaluations: BadgeEvaluation[],
  scores: ScoreResult
): Promise<Blob> {
  const canvas = await drawCardOnCanvas(1200, 627, profile, evaluations, scores);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}

export async function generatePDF(
  profile: GitHubProfile,
  evaluations: BadgeEvaluation[],
  roadmap: RoadmapResult
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  // Page 1: Profile Summary
  doc.setFillColor(247, 249, 246);
  doc.rect(0, 0, 595, 842, 'F');

  doc.setTextColor(22, 33, 26);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('GitHub Badge Report', 60, 100);

  doc.setTextColor(31, 111, 74);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(16);
  doc.text(`@${profile.username}`, 60, 130);

  doc.setFontSize(12);
  doc.setTextColor(22, 33, 26);
  doc.text(`Name: ${profile.name}`, 60, 170);
  doc.text(`Bio: ${profile.bio || 'No bio provided'}`, 60, 190);
  doc.text(`Account Age: ${profile.accountAgeYears} years`, 60, 210);

  doc.setTextColor(79, 97, 86);
  doc.text(`Followers: ${profile.followers} | Following: ${profile.following}`, 60, 230);
  doc.text(`Public Repositories: ${profile.publicRepos}`, 60, 250);

  const unlocked = evaluations.filter((e) => e.status === 'Unlocked');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(31, 111, 74);
  doc.text(`Unlocked Achievements: ${unlocked.length} / ${evaluations.length}`, 60, 300);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(22, 33, 26);
  let yOffset = 330;
  unlocked.slice(0, 15).forEach((badge) => {
    doc.text(`- ${badge.definition.name} (${badge.currentTier})`, 80, yOffset);
    yOffset += 20;
  });

  if (unlocked.length > 15) {
    doc.text(`... and ${unlocked.length - 15} more`, 80, yOffset);
  }

  // Page 2: Roadmap steps
  doc.addPage();
  doc.setFillColor(247, 249, 246);
  doc.rect(0, 0, 595, 842, 'F');

  doc.setTextColor(22, 33, 26);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Personalized Unlock Roadmap', 60, 80);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(79, 97, 86);
  doc.text(`Estimated Days Left: ${roadmap.totalEstimatedDays} days`, 60, 110);

  let ryOffset = 150;
  roadmap.steps.forEach((step, idx) => {
    doc.setTextColor(22, 33, 26);
    doc.text(`${idx + 1}. ${step.action}`, 60, ryOffset);
    doc.setTextColor(79, 97, 86);
    doc.text(`   Difficulty: ${step.difficulty} | Est. ${step.estimatedDays} days`, 60, ryOffset + 15);
    ryOffset += 45;
  });

  doc.save(`${profile.username}-github-badge-report.pdf`);
}
