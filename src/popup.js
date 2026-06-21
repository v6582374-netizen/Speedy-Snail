(() => {
  "use strict";

  const DEFAULT_SETTINGS = {
    fastRate: 3,
    autoQuality: true
  };
  const RATE_OPTIONS = [1.5, 2, 3];
  const USAGE_STATS_KEY = "speederUsageStats";
  const DEFAULT_USAGE_STATS = {
    totalSavedMs: 0,
    totalFastForwardMs: 0,
    sessionCount: 0,
    lastRate: 0,
    lastBaseRate: 0,
    lastDurationMs: 0,
    lastSavedMs: 0,
    lastUpdatedAt: 0
  };

  const speedValue = document.getElementById("speed-value");
  const status = document.getElementById("status");
  const qualityToggle = document.getElementById("quality-toggle");
  const speedButtons = Array.from(document.querySelectorAll(".speed-option"));
  const usageTotalSaved = document.getElementById("usage-total-saved");
  const usageTotalFastForward = document.getElementById("usage-total-fast-forward");
  const usageSessionCount = document.getElementById("usage-session-count");
  const usageLastRate = document.getElementById("usage-last-rate");
  const usageLastDuration = document.getElementById("usage-last-duration");
  const usageLastSaved = document.getElementById("usage-last-saved");

  let settings = { ...DEFAULT_SETTINGS };
  let usageStats = { ...DEFAULT_USAGE_STATS };
  let statusTimer = null;

  function sanitizeSettings(items) {
    const fastRate = Number(items.fastRate);

    return {
      fastRate: RATE_OPTIONS.includes(fastRate) ? fastRate : DEFAULT_SETTINGS.fastRate,
      autoQuality:
        typeof items.autoQuality === "boolean" ? items.autoQuality : DEFAULT_SETTINGS.autoQuality
    };
  }

  function readSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
        resolve(sanitizeSettings(items));
      });
    });
  }

  function sanitizeUsageStats(items = {}) {
    const toMs = (value) => Math.max(0, Math.round(Number(value) || 0));
    const toRate = (value) => {
      const rate = Number(value);
      return Number.isFinite(rate) && rate > 0 ? rate : 0;
    };
    const toCount = (value) => Math.max(0, Math.round(Number(value) || 0));

    return {
      totalSavedMs: toMs(items.totalSavedMs),
      totalFastForwardMs: toMs(items.totalFastForwardMs),
      sessionCount: toCount(items.sessionCount),
      lastRate: toRate(items.lastRate),
      lastBaseRate: toRate(items.lastBaseRate),
      lastDurationMs: toMs(items.lastDurationMs),
      lastSavedMs: toMs(items.lastSavedMs),
      lastUpdatedAt: toMs(items.lastUpdatedAt)
    };
  }

  function readUsageStats() {
    return new Promise((resolve) => {
      chrome.storage.local.get({ [USAGE_STATS_KEY]: DEFAULT_USAGE_STATS }, (items) => {
        resolve(sanitizeUsageStats(items[USAGE_STATS_KEY]));
      });
    });
  }

  function writeSettings(nextSettings) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(nextSettings, resolve);
    });
  }

  function watchStats() {
    if (!chrome.storage?.onChanged) {
      return;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes[USAGE_STATS_KEY]) {
        return;
      }

      usageStats = sanitizeUsageStats(changes[USAGE_STATS_KEY].newValue || {});
      render();
    });
  }

  function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.round(Number(ms) / 1000));
    if (totalSeconds < 60) {
      return `${totalSeconds}秒`;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}分${seconds.toString().padStart(2, "0")}秒`;
  }

  function formatRate(rate) {
    const value = Number(rate);
    if (!Number.isFinite(value) || value <= 0) {
      return "-";
    }

    return Number.isInteger(value) ? `${value}x` : `${value.toFixed(1)}x`;
  }

  function render() {
    speedValue.textContent = `${settings.fastRate}x`;

    speedButtons.forEach((button) => {
      const selected = Number(button.dataset.rate) === settings.fastRate;
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });

    qualityToggle.setAttribute("aria-checked", String(settings.autoQuality));

    usageTotalSaved.textContent = formatDuration(usageStats.totalSavedMs);
    usageTotalFastForward.textContent = formatDuration(usageStats.totalFastForwardMs);
    usageSessionCount.textContent = `${usageStats.sessionCount} 次`;
    usageLastRate.textContent = formatRate(usageStats.lastRate);
    usageLastDuration.textContent = formatDuration(usageStats.lastDurationMs);
    usageLastSaved.textContent = formatDuration(usageStats.lastSavedMs);
  }

  function showStatus(message) {
    status.textContent = message;

    if (statusTimer) {
      window.clearTimeout(statusTimer);
    }

    statusTimer = window.setTimeout(() => {
      status.textContent = "";
    }, 1200);
  }

  async function updateSettings(nextSettings) {
    settings = sanitizeSettings({ ...settings, ...nextSettings });
    render();
    await writeSettings(settings);
    showStatus("已保存");
  }

  speedButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateSettings({ fastRate: Number(button.dataset.rate) });
    });
  });

  qualityToggle.addEventListener("click", () => {
    updateSettings({ autoQuality: !settings.autoQuality });
  });

  readSettings().then((storedSettings) => {
    settings = storedSettings;
    watchStats();
    return readUsageStats().then((storedUsageStats) => {
      usageStats = storedUsageStats;
      render();
    });
  });
})();
