/**
 * Redact secrets from URLs and strings before logging (API keys must not appear in logs).
 */
function redactUrl(url) {
  if (url == null || typeof url !== "string") return url;
  return url
    .replace(/([?&]key=)[^&]*/gi, "$1[REDACTED]")
    .replace(/([?&]access_token=)[^&]*/gi, "$1[REDACTED]");
}

function redactString(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/\bAIza[A-Za-z0-9_-]{35}\b/g, "[REDACTED]")
    .replace(/key=([A-Za-z0-9_-]{20,})/gi, "key=[REDACTED]");
}

/**
 * Safe structured copy of Error / AxiosError for console logging (no API keys in config.url).
 */
function safeErrorForLog(err) {
  if (err == null) return err;
  if (typeof err !== "object") return err;

  const out = {
    name: err.name,
    message: typeof err.message === "string" ? redactString(err.message) : err.message,
    code: err.code,
  };

  if (err.response) {
    out.response = {
      status: err.response.status,
      statusText: err.response.statusText,
      data: err.response.data,
    };
  }

  if (err.config) {
    out.config = {
      method: err.config.method,
      url: redactUrl(err.config.url),
      baseURL: err.config.baseURL ? redactUrl(String(err.config.baseURL)) : undefined,
      timeout: err.config.timeout,
    };
    const d = err.config.data;
    if (typeof d === "string" && d.length > 0) {
      out.config.dataPreview = redactString(d.slice(0, 800));
    }
  }

  if (typeof err.stack === "string") {
    out.stack = redactString(err.stack);
  }

  return out;
}

module.exports = { redactUrl, redactString, safeErrorForLog };
