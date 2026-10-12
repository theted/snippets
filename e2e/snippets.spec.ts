/**
 * Snippets — end-to-end tests
 *
 * These tests run against a live deployment (E2E_BASE_URL).
 *
 * - "Signed-out visitors" runs when Google sign-in is enabled (production).
 *   It only reads, plus write attempts the API must reject, so it is safe to
 *   run after every deploy.
 * - "Snippets CRUD" runs when sign-in is disabled (a local or preview stack
 *   with GOOGLE_AUTH_ENABLED=false or the json-server API). Each test creates
 *   its own data and cleans up after itself.
 *
 * Required env:
 *   E2E_BASE_URL  – frontend URL   (consumed by playwright.config.ts)
 *   E2E_API_URL   – API base URL   (defaults to E2E_BASE_URL + /api)
 */

import { test, expect, type APIRequestContext } from '@playwright/test';

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

function apiUrl(): string {
  const explicit = process.env.E2E_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  // Deployed stacks proxy the API under /api on the frontend host.
  const base = (process.env.E2E_BASE_URL ?? '').replace(/\/$/, '');
  return `${base}/api`;
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

/** GET /auth/session → whether writes require a Google sign-in. */
async function isAuthEnabled(request: APIRequestContext): Promise<boolean> {
  const response = await request.get(`${apiUrl()}/auth/session`);
  // The json-server mock API has no /auth routes, and its writes are open.
  if (response.status() === 404) return false;
  expect(response.ok(), `API session check failed: ${response.status()}`).toBeTruthy();
  const { authEnabled } = await response.json();
  return authEnabled === true;
}

/** GET /snippets */
async function apiListSnippets(request: APIRequestContext): Promise<Snippet[]> {
  const response = await request.get(`${apiUrl()}/snippets`);
  expect(response.ok(), `API list failed: ${response.status()}`).toBeTruthy();
  return response.json() as Promise<Snippet[]>;
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

// No snippet has this id, so a write that slips past auth still changes nothing.
const MISSING_SNIPPET_ID = 2147483647;

// ---------------------------------------------------------------------------
// Signed-out visitors (sign-in enabled)
// ---------------------------------------------------------------------------

test.describe('Signed-out visitors', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await isAuthEnabled(request)), 'Sign-in is disabled on this deployment.');
  });

  test('can browse snippets but not create them', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Snippets');
    await expect(page.locator('[data-testid="snippet-card"]').first()).toBeVisible();

    const createButton = page.getByRole('button', { name: /create snippet/i }).first();
    await expect(createButton).toBeDisabled();
    await expect(createButton).toHaveAttribute('title', /sign in with google/i);
  });

  test('see a snippet without edit or delete controls', async ({ page, request }) => {
    const [snippet] = await apiListSnippets(request);

    await page.goto(`/snippets/${snippet.id}`);

    await expect(page.getByRole('heading', { name: snippet.title })).toBeVisible();
    const card = page.locator('[data-testid="snippet-card"]').first();
    await expect(card.getByRole('button', { name: /copy/i })).toBeVisible();
    // Button names include an icon-font glyph, so match by substring.
    await expect(card.getByRole('button', { name: 'Edit' })).toHaveCount(0);
    await expect(card.getByRole('button', { name: 'Delete' })).toHaveCount(0);
  });

  test('cannot write through the API without a session', async ({ request }) => {
    const responses = await Promise.all([
      request.post(`${apiUrl()}/snippets`, { data: {} }),
      request.put(`${apiUrl()}/snippets/${MISSING_SNIPPET_ID}`, { data: {} }),
      request.delete(`${apiUrl()}/snippets/${MISSING_SNIPPET_ID}`),
    ]);

    expect(responses.map((response) => response.status())).toEqual([401, 401, 401]);
  });
});

// ---------------------------------------------------------------------------
// Snippets CRUD (sign-in disabled)
// ---------------------------------------------------------------------------

test.describe('Snippets CRUD', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(
      await isAuthEnabled(request),
      'Writes need a Google sign-in here; run against a stack with GOOGLE_AUTH_ENABLED=false.',
    );
  });

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
      await expect(page.getByRole('heading', { name: title })).toBeVisible();

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
        page.getByRole('heading', { name: updatedTitle }),
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
    await card.getByRole('button', { name: 'Delete' }).click();

    // Confirmation dialog should appear.
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/delete this snippet/i);

    // Confirm deletion.
    await dialog.getByRole('button', { name: 'Delete' }).click();

    // Should navigate back to the home page after deletion.
    await page.waitForURL('/', { timeout: 15_000 });
    expect(page.url()).not.toContain(`/snippets/${snippet.id}`);

    // The snippet should no longer be reachable.
    const apiResponse = await request.get(`${apiUrl()}/snippets/${snippet.id}`);
    expect(apiResponse.status()).toBe(404);
  });
});
