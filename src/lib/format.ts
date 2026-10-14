export function formatDate(value: string) {
  const iso = /[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
  return new Date(iso).toLocaleDateString("en-GB");
}