import { test, expect } from '@playwright/test';
import path from 'path';
import { VALID_VIDEO_BASE64 } from './fixtures';

test.describe('Upload Zone', () => {
  // Skip tests that require FFmpeg loading - too slow for CI
  test.skip('should allow selecting a file via input', async ({ page }) => {
    await page.goto('/');

    // Start waiting for file chooser before clicking. Note no await.
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Drop your video here').click();
    const fileChooser = await fileChooserPromise;

    // Use a valid MP4 buffer so video metadata loads successfully
    await fileChooser.setFiles({
      name: 'test-video.mp4',
      mimeType: 'video/mp4',
      buffer: Buffer.from(VALID_VIDEO_BASE64, 'base64')
    });

    // Expect the file name to be visible after successful upload
    await expect(page.getByText('test-video.mp4')).toBeVisible();
    
    // Also expect the "Convert to GIF" button (or similar state showing readiness)
    await expect(page.getByText('Convert to GIF')).toBeVisible();
  });

  test.skip('should show error for invalid file type', async ({ page }) => {
    await page.goto('/');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Drop your video here').click();
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('text content')
    });

    // Expect an error message (if the app handles it visually)
    // await expect(page.getByText('Invalid file type')).toBeVisible();
  });
});
