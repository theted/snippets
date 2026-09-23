/**
 * Snippet CRUD — end-to-end tests
 *
 * These tests run against a live deployment (E2E_BASE_URL).
 * Each test creates its own data and cleans up after itself so they
 * can be safely run against the production database.
 *
 * Required env:
 *   E2E_BASE_URL  – frontend URL   (consumed by playwright.config.ts)
 *   E2E_API_URL   – API server URL (defaults to E2E_BASE_URL with :3200)
 */

import { test, expect, type APIRequestContext } from '@playwright/test';

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

function apiUrl(): string {
  const explicit = process.env.E2E_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  // Fall back: same host as the frontend but on port 3200.
  const base = process.env.E2E_BASE_URL ?? '';
  try {
    const u = new URL(base);
    u.port = '3200';
    return u.origin;
  } catch {
    return 'http://localhost:3200';
  }
}

interface SnippetPayload {
  title: string;
  content: string;
  language?: string;
  description?: string;
}

interface Snippet extends Required<SnippetPayload> {
  id: number;
}

/** POST /snippets → newly created snippet */
async function apiCreateSnippet(request: APIRequestContext, payload: SnippetPayload): Promise<Snippet> {
  const response = await request.post(`${apiUrl()}/snippets`, { data: payload });
  expect(response.ok(), `API create failed: ${response.status()}`).toBeTruthy();
  return response.json() as Promise<Snippet>;
}

/** DELETE /snippets/:id */
async function apiDeleteSnippet(request: APIRequestContext, id: number): Promise<void> {
  await request.delete(`${apiUrl()}/snippets/${id}`);
}

// ---------------------------------------------------------------------------
// Unique test titles so parallel CI runs don't collide.
// ---------------------------------------------------------------------------

function uniqueTitle(base: string): string {
  return `[E2E] ${base} ${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Snippets CRUD', () => {
  // ── Create ─────────────────────────────────────────────────────────────────

  test('create a snippet via the UI', async ({ page, request }) => {
    const title = uniqueTitle('Create via UI');
    const code = 'console.log("e2e create");';
    let createdId: number | undefined;

    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Snippets');

    // Open the create modal.
    await page.getByRole('button', { name: /create snippet/i }).first().click();

    // Wait for the form to appear.
    const titleInput = page.locator('#snippet-title');
    await expect(titleInput).toBeVisible();

    // Fill title.
    await titleInput.fill(title);

    // Fill code into the CodeMirror editor.
    const codeEditor = page.locator('.cm-content[contenteditable="true"]').first();
    await codeEditor.click();
    await page.keyboard.type(code);

    // Select language.
    await page.locator('#snippet-language').selectOption('javascript');

    // Submit the form.
    await page.getByRole('button', { name: /^create$/i }).click();

    // The modal should close and the new snippet card should appear.
    await expect(titleInput).not.toBeVisible();
    const card = page.locator('[data-testid="snippet-card"]').filter({ hasText: title });
    await expect(card).toBeVisible({ timeout: 15_000 });

    // Capture the id from the link so we can clean up.
    const href = await card.locator('a[href^="/snippets/"]').first().getAttribute('href');
    if (href) {
      const match = href.match(/\/snippets\/(\d+)/);
      if (match) createdId = Number(match[1]);
    }

    // Cleanup.
    if (createdId !== undefined) {
      await apiDeleteSnippet(request, createdId);
    }
  });

  // ── View ───────────────────────────────────────────────────────────────────

  test('view a snippet on its detail page', async ({ page, request }) => {
    const title = uniqueTitle('View snippet');
    const code = 'const viewed = true;';

    const snippet = await apiCreateSnippet(request, {
      title,
      content: code,
      language: 'javascript',
    });

    try {
      await page.goto(`/snippets/${snippet.id}`);

      // Title should appear in the page.
      await expect(page.getByRole('heading', { name: new RegExp(title, 'i') })).toBeVisible();

      // Code content should be rendered.
      await expect(page.locator('[data-testid="snippet-card"]')).toContainText(code);

      // URL should match.
      expect(page.url()).toContain(`/snippets/${snippet.id}`);
    } finally {
      await apiDeleteSnippet(request, snippet.id);
    }
  });

  // ── Edit ───────────────────────────────────────────────────────────────────

  test('edit a snippet via the UI', async ({ page, request }) => {
    const originalTitle = uniqueTitle('Edit original');
    const updatedTitle = uniqueTitle('Edit updated');

    const snippet = await apiCreateSnippet(request, {
      title: originalTitle,
      content: 'let x = 1;',
      language: 'javascript',
    });

    try {
      await page.goto(`/snippets/${snippet.id}`);

      // Hover over the card to reveal action controls.
      const card = page.locator('[data-testid="snippet-card"]');
      await expect(card).toBeVisible();
      await card.hover();

      // Click the Edit button.
      await card.getByRole('button', { name: /edit/i }).click();

      // The edit form modal should open.
      const titleInput = page.locator('#snippet-title');
      await expect(titleInput).toBeVisible();

      // Update the title.
      await titleInput.fill(updatedTitle);

      // Submit.
      await page.getByRole('button', { name: /update/i }).click();

      // Modal closes; updated title appears.
      await expect(titleInput).not.toBeVisible();
      await expect(
        page.getByRole('heading', { name: new RegExp(updatedTitle, 'i') }),
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await apiDeleteSnippet(request, snippet.id);
    }
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  test('delete a snippet via the UI', async ({ page, request }) => {
    const title = uniqueTitle('Delete me');

    const snippet = await apiCreateSnippet(request, {
      title,
      content: 'to_be_deleted = True',
      language: 'python',
    });

    await page.goto(`/snippets/${snippet.id}`);

    const card = page.locator('[data-testid="snippet-card"]');
    await expect(card).toBeVisible();
    await card.hover();

    // Click the Delete button on the snippet card.
    await card.getByRole('button', { name: /^delete$/i }).click();

    // Confirmation dialog should appear.
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/delete this snippet/i);

    // Confirm deletion.
    await dialog.getByRole('button', { name: /^delete$/i }).click();

    // Should navigate back to the home page after deletion.
    await page.waitForURL('/', { timeout: 15_000 });
    expect(page.url()).not.toContain(`/snippets/${snippet.id}`);

    // The snippet should no longer be reachable.
    const apiResponse = await request.get(`${apiUrl()}/snippets/${snippet.id}`);
    expect(apiResponse.status()).toBe(404);
  });
});
