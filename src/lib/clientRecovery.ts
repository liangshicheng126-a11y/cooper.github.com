const STATIC_REFRESH_PARAM = "__cooper_static_refresh";
const STATIC_RECOVERY_KEY = "cooper-static-recovery-v1";

export function getClientAssetRecoveryScript(): string {
  return `
(function () {
  var refreshParam = "${STATIC_REFRESH_PARAM}";
  var recoveryKey = "${STATIC_RECOVERY_KEY}";
  var currentUrl = new URL(window.location.href);
  var isRecoveryLoad = currentUrl.searchParams.has(refreshParam);

  function isNextAsset(url) {
    return typeof url === "string" && url.indexOf("/_next/static/") !== -1;
  }

  function isChunkFailure(value) {
    var message = String(value || "");
    return /ChunkLoadError|Loading chunk [^ ]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(message);
  }

  function recover() {
    if (isRecoveryLoad) return;

    try {
      var now = Date.now();
      var previous = Number(sessionStorage.getItem(recoveryKey) || 0);
      if (now - previous < 45000) return;
      sessionStorage.setItem(recoveryKey, String(now));
    } catch (error) {}

    var freshUrl = new URL(window.location.href);
    freshUrl.searchParams.set(refreshParam, String(Date.now()));
    window.location.replace(freshUrl.toString());
  }

  window.addEventListener("error", function (event) {
    var target = event.target;
    if (target && (target.tagName === "SCRIPT" || target.tagName === "LINK")) {
      var assetUrl = target.src || target.href || "";
      if (isNextAsset(assetUrl)) recover();
      return;
    }

    if (isChunkFailure(event.message || (event.error && event.error.message))) {
      recover();
    }
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    if (isChunkFailure(reason && (reason.message || reason))) recover();
  });

  if (isRecoveryLoad) {
    var cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete(refreshParam);
    window.history.replaceState(window.history.state, "", cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
  }
})();
`.trim();
}
