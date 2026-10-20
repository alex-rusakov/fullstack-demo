import { test, expect } from "@playwright/test";

const email = "e2e-" + Date.now() + "@example.com";
const password = "correct horse battery staple";

test("signup → session → protected route → logout", async ({ page }) => {
  // Sign up
  await page.goto("http://localhost:3000");
  await page.getByPlaceholder("email").fill(email);
  await page.getByPlaceholder("password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();

  // Session cookie is set — protected resource is reachable
  await page.getByPlaceholder("New item title").fill("First item");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByRole("heading", { name: "First item" })).toBeVisible();

  // Logout clears the session
  await page.request.post("/api/auth/logout");
  await page.reload();
  await expect(page.getByText("No items yet")).toBeVisible();
});

test("protected API rejects anonymous requests", async ({ request }) => {
  const res = await request.get("/api/items");
  expect(res.status()).toBe(401);
});

test("login rejects wrong password", async ({ request }) => {
  const res = await request.post("/api/auth/login", {
    data: { email, password: "wrong-password" },
  });
  expect(res.status()).toBe(401);
});
