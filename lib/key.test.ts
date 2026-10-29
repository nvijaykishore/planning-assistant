import assert from "node:assert/strict";
import test from "node:test";
import { describeKey, normalizeApiKey, rejectedKeyMessage } from "./grok";

test("normalizeApiKey keeps a bare console key", () => {
  assert.equal(normalizeApiKey("  xai-abc  "), "xai-abc");
});

test("normalizeApiKey strips quotes, Bearer, and an accidental assignment", () => {
  assert.equal(normalizeApiKey('"xai-abc"'), "xai-abc");
  assert.equal(normalizeApiKey("'xai-abc'"), "xai-abc");
  assert.equal(normalizeApiKey("Bearer xai-abc"), "xai-abc");
  assert.equal(normalizeApiKey('XAI_API_KEY="xai-abc"'), "xai-abc");
});

test("describeKey names the kind and the length, and hides the secret", () => {
  const secret = "xai-super-secret-value";
  const description = describeKey(secret);
  assert.equal(description, `a console key, ${secret.length} characters`);
  assert.equal(description.includes("super-secret"), false);
  assert.equal(describeKey("eyJhbGci"), "a session token, 8 characters");
  assert.equal(describeKey("sk-test"), "an OpenAI-style key, 7 characters");
  assert.match(rejectedKeyMessage(description), /starts with xai-/);
});
