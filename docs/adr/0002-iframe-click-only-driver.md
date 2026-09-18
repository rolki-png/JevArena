# Drive each Agent through an isolated iframe, not Playwright

Each Agent plays Snake in its own same-origin iframe Browser. Jev may only Click indexed on-screen direction buttons or Wait. That keeps the browser-agent boundary (live page state, indexed DOM targets, real clicks) without server-side Chromium. Playwright can replace the transport later without changing the Jev request contract; it is not the production driver.
