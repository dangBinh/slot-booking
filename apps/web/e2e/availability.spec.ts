import { test, expect } from '@playwright/test';

test('user adds and deletes an availability rule', async ({ page }) => {
  await page.goto('/settings');

  await expect(page.getByTestId('settings-page')).toBeVisible();
  await expect(page.getByTestId('provider-select')).toBeVisible();

  // wait for either the rules list or the empty state to render
  await expect(
    page.getByTestId('rules-list').or(page.getByTestId('rules-empty')),
  ).toBeVisible({ timeout: 10_000 });

  // Add a Saturday 10:00-11:00 30-min rule
  // weekday select uses MUI Select — click the combobox by label then pick
  await page.getByRole('combobox', { name: 'Weekday' }).click();
  await page.getByRole('option', { name: 'Sat' }).click();

  await page.getByTestId('rule-start').fill('10:00');
  await page.getByTestId('rule-end').fill('11:00');
  await page.getByTestId('rule-duration').fill('30');

  await page.getByTestId('rule-add').click();

  // It now appears in the list
  const list = page.getByTestId('rules-list');
  await expect(list).toBeVisible({ timeout: 10_000 });
  const row = list.locator('li').filter({ hasText: 'Sat: 10:00–11:00' });
  await expect(row).toBeVisible();

  // Delete it — the delete button is inside the row
  await row.getByRole('button', { name: 'delete' }).click();

  // The row is gone
  await expect(row).toHaveCount(0, { timeout: 10_000 });
});

test('user adds and deletes a blackout', async ({ page }) => {
  await page.goto('/settings');

  await expect(page.getByTestId('settings-page')).toBeVisible();
  await expect(page.getByTestId('provider-select')).toBeVisible();

  await expect(page.getByTestId('blackouts-section')).toBeVisible({ timeout: 10_000 });

  await expect(
    page.getByTestId('blackouts-list').or(page.getByTestId('blackouts-empty')),
  ).toBeVisible({ timeout: 10_000 });

  // Pick the *next-next* Monday in UTC to avoid the seed's pre-bookings on the
  // upcoming Monday at 10:00.
  const target = new Date();
  while (target.getUTCDay() !== 1) target.setUTCDate(target.getUTCDate() + 1);
  target.setUTCDate(target.getUTCDate() + 7);
  const mm = String(target.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(target.getUTCDate()).padStart(2, '0');
  const yyyy = target.getUTCFullYear();
  const dateInput = page.getByTestId('blackout-date');
  await dateInput.click();
  await dateInput.fill(`${mm}/${dd}/${yyyy}`);

  await page.getByTestId('blackout-time').fill('10:00');

  await page.getByTestId('blackout-add').click();

  const list = page.getByTestId('blackouts-list');
  await expect(list).toBeVisible({ timeout: 10_000 });
  const row = list.locator('li').filter({ hasText: '10:00–10:30' });
  await expect(row).toBeVisible();

  await row.getByRole('button', { name: 'delete' }).click();
  await expect(row).toHaveCount(0, { timeout: 10_000 });
});
