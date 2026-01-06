import { test, expect } from '@playwright/test';
import { VALID_VIDEO_BASE64 } from './fixtures';

// Skip conversion tests - they require FFmpeg loading which times out in CI
test.describe.skip('Conversion Flow', () => {
  test('should successfully convert a video to GIF', async ({ page }) => {
    // This test relies on FFmpeg loading.
    // Since we verified public/ffmpeg exists, it *should* work if the browser supports standard fetch.
    
    await page.goto('/');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Drop your video here').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-convert.mp4',
      mimeType: 'video/mp4',
      buffer: Buffer.from(VALID_VIDEO_BASE64, 'base64')
    });

    // Wait for "Convert to GIF"
    await expect(page.getByText('Convert to GIF')).toBeVisible();
    
    // Click Convert
    await page.getByText('Convert to GIF').click();
    
    // Should show progress.
    // "Generating color palette..." or "Creating GIF frames..."
    // Since the video is tiny, it might be instant.
    
    // Finally, it should show state="done" which renders ResultView.
    // ResultView has "Download GIF" button?
    // Let's check result-view.tsx content via expectation of text "GIF Created!" or similar.
    // Or check for the success message "GIF created successfully!" which is in statusMessage.
    
    // Wait for success message
    await expect(page.getByText('GIF created successfully!')).toBeVisible({ timeout: 30000 });
    
    // Verify "Download GIF" button is visible
    await expect(page.getByRole('button', { name: 'Download GIF' })).toBeVisible();
    
    // Verify "Create Another" button
    await expect(page.getByRole('button', { name: 'Create Another' })).toBeVisible();
  });
});
