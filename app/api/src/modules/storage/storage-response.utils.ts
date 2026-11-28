export function safeContentType(value: string) {
  return /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(value)
    ? value
    : 'application/octet-stream';
}

export function contentDisposition(
  disposition: 'attachment' | 'inline',
  value: string,
) {
  const encoded = encodeURIComponent(value).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `${disposition}; filename*=UTF-8''${encoded}`;
}
