/**
 * Render text overlay to a PNG blob using Canvas
 * Creates a transparent image with meme-style text (white with black outline)
 */
export async function renderTextOverlay(
  topText: string,
  bottomText: string,
  width: number,
  height: number
): Promise<Blob | null> {
  // If no text, return null
  if (!topText.trim() && !bottomText.trim()) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Transparent background
  ctx.clearRect(0, 0, width, height);

  // Calculate font size based on width (responsive)
  const fontSize = Math.max(24, Math.min(48, Math.floor(width / 12)));

  // Meme style: Impact font, white fill, black stroke
  ctx.font = `bold ${fontSize}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = Math.max(2, fontSize / 12);
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  // Draw top text
  if (topText.trim()) {
    const upperText = topText.toUpperCase();
    const topY = fontSize + 10;

    // Draw stroke first (behind), then fill (on top)
    ctx.strokeText(upperText, width / 2, topY);
    ctx.fillText(upperText, width / 2, topY);
  }

  // Draw bottom text
  if (bottomText.trim()) {
    const lowerText = bottomText.toUpperCase();
    const bottomY = height - 15;

    ctx.strokeText(lowerText, width / 2, bottomY);
    ctx.fillText(lowerText, width / 2, bottomY);
  }

  // Convert canvas to PNG Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create text overlay blob"));
        }
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Get the dimensions for the text overlay based on output settings
 * The overlay should match the final GIF dimensions
 */
export function getOverlayDimensions(
  originalWidth: number,
  originalHeight: number,
  outputWidth: number
): { width: number; height: number } {
  const aspectRatio = originalHeight / originalWidth;
  const height = Math.round(outputWidth * aspectRatio);
  return { width: outputWidth, height };
}
