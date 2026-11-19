export async function invoiceError(error) {
  if (error.response?.data instanceof Blob) {
    try { return JSON.parse(await error.response.data.text()).message || "Unable to load invoice."; } catch { return "Unable to load invoice."; }
  }
  return error.response?.data?.message || error.message || "Unable to load invoice.";
}
export async function saveInvoicePdf(blob, id) {
  if (!(blob instanceof Blob) || await blob.slice(0, 5).text() !== "%PDF-") throw new Error("The server did not return a valid PDF.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `invoice-${Number(id)}.pdf`;
  document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function decodeInvoiceDocument(body) {
  if (body?.error) throw new Error(body.message || "Invoice unavailable.");
  const data = body?.data;
  if (data?.content_type !== "application/pdf" || typeof data.content_base64 !== "string") {
    throw new Error("The server did not return a valid invoice document.");
  }
  let binary;
  try { binary = atob(data.content_base64); }
  catch { throw new Error("The server returned an invalid invoice document."); }
  if (!binary.startsWith("%PDF-")) throw new Error("The server did not return a valid PDF.");
  return new Blob([Uint8Array.from(binary, character => character.charCodeAt(0))], { type: "application/pdf" });
}
