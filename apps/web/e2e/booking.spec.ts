import { test, expect } from '@playwright/test';

test('user picks a day from the calendar and books a slot', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Slot Booking')).toBeVisible();
  await expect(page.getByTestId('provider-select')).toBeVisible();

  await expect(page.getByTestId('month-calendar')).toBeVisible({ timeout: 10_000 });

  const dayList = page.getByTestId('day-slot-list');
  await expect(dayList).toBeVisible({ timeout: 10_000 });

  const firstSlot = dayList.locator('button[data-status="AVAILABLE"]').first();
  await expect(firstSlot).toBeVisible();
  const slotTestId = await firstSlot.getAttribute('data-testid');
  expect(slotTestId).toMatch(/^slot-/);
  await firstSlot.click();

  await page.getByTestId('customer-name').fill('E2E Tester');
  await page.getByTestId('customer-email').fill('e2e@example.com');
  await page.getByTestId('confirm-booking').click();

  await expect(page.getByTestId('booking-confirmation')).toBeVisible();

  // The booked slot is now rendered as disabled with status=BOOKED.
  const bookedSlot = page.getByTestId(slotTestId!);
  await expect(bookedSlot).toHaveAttribute('data-status', 'BOOKED', { timeout: 10_000 });
  await expect(bookedSlot).toBeDisabled();
});
