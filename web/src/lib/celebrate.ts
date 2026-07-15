import confetti from "canvas-confetti";

const teal = ["#0F766E", "#14B8A6", "#E8A317", "#FDE68A", "#FFFFFF"];

/** Light burst after a new review */
export function celebrateReview() {
  confetti({
    particleCount: 70,
    spread: 62,
    startVelocity: 28,
    origin: { y: 0.7 },
    colors: teal,
    disableForReducedMotion: true,
  });
}

/** Bigger fireworks on level-up */
export function celebrateLevelUp() {
  const end = Date.now() + 1200;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: teal,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: teal,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();

  confetti({
    particleCount: 120,
    spread: 90,
    startVelocity: 38,
    origin: { y: 0.55 },
    colors: teal,
    disableForReducedMotion: true,
  });
}
