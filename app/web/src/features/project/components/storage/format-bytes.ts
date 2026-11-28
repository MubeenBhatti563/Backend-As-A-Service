export function formatBytes(value: string) {
  let bytes = BigInt(value);
  const base = BigInt(1024);
  if (bytes < base) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB", "PB"];
  let unitIndex = -1;
  let remainder = BigInt(0);
  while (bytes >= base && unitIndex < units.length - 1) {
    remainder = bytes % base;
    bytes /= base;
    unitIndex += 1;
  }
  const decimal = (remainder * BigInt(10)) / base;
  return `${bytes}${decimal ? `.${decimal}` : ""} ${units[unitIndex]}`;
}
