// The Content-Type each kind of first-party resource must be served with.
// Every pattern is anchored at the start, so each alternative is read as a
// prefix: `^(?:image\/|.*icon)` is "starts with image/, or mentions icon".
export const typeOk = {
  stylesheet: /^text\/css/,
  script: /^(?:.*javascript)/,
  font: /^(?:.*font|.*octet-stream)/,
  image: /^image\//,
  icon: /^(?:image\/|.*icon)/,
  manifest: /^(?:.*json)/,
};
