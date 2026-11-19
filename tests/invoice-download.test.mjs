import test from "node:test";
import assert from "node:assert/strict";
import { invoiceError, saveInvoicePdf, decodeInvoiceDocument } from "../src/services/invoiceDownload.js";

test("PDF download creates and releases an attachment URL", async () => {
  let clicked = 0, removed = 0, revoked, timer, link = {};
  globalThis.document = { createElement: () => Object.assign(link, { click: () => clicked++, remove: () => removed++ }), body: { appendChild() {} } };
  globalThis.window = { setTimeout: fn => { timer = fn; } };
  const create = URL.createObjectURL, revoke = URL.revokeObjectURL;
  URL.createObjectURL = () => "blob:test"; URL.revokeObjectURL = url => { revoked = url; };
  try {
    await saveInvoicePdf(new Blob(["%PDF-1.7 test"]), 12);
    assert.equal(clicked, 1); assert.equal(removed, 1); assert.equal(link.download, "invoice-12.pdf");
    assert.equal(revoked, undefined); timer(); assert.equal(revoked, "blob:test");
  } finally { URL.createObjectURL = create; URL.revokeObjectURL = revoke; }
});
test("JSON and HTML errors are never downloaded as PDF", async () => {
  for (const body of ['{"error":true}', '<html>Error</html>', '']) await assert.rejects(saveInvoicePdf(new Blob([body]), 1), /valid PDF/);
});
test("blob API errors preserve the safe server message", async () => {
  assert.equal(await invoiceError({response:{data:new Blob([JSON.stringify({message:"Invoice not found"})])}}), "Invoice not found");
  assert.equal(await invoiceError({response:{data:new Blob(["invalid"])} }), "Unable to load invoice.");
});

test("JSON invoice transport preserves binary PDF bytes", async () => {
  const binary = "%PDF-1.7\n" + String.fromCharCode(0, 128, 255);
  const blob = decodeInvoiceDocument({ error: false, data: { content_type: "application/pdf", content_base64: btoa(binary) } });
  assert.equal(blob.type, "application/pdf");
  assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), Uint8Array.from(binary, c => c.charCodeAt(0)));
});
test("JSON invoice transport rejects errors and non-PDF content", () => {
  for (const body of [{ error: true, message: "Invoice not found" }, {}, { data: { content_type: "application/pdf", content_base64: "!!!" } }, { data: { content_type: "application/pdf", content_base64: btoa("<html>Error</html>") } }]) {
    assert.throws(() => decodeInvoiceDocument(body));
  }
});
