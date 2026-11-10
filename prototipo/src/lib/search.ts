/** Pasa a minúsculas y quita tildes, para que "robotica" encuentre "Robótica". */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
