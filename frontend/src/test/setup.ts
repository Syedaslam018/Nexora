import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmounts every rendered component after each test — without this, DOM
// from one test can leak into the next and cause confusing failures
// (duplicate elements, stale event listeners).
afterEach(() => {
  cleanup();
});
