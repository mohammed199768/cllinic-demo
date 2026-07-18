/**
 * Printing uses the browser's native print dialog (which offers "Save as PDF").
 * No heavy PDF dependency is loaded. Print CSS in globals.css hides the site
 * chrome and reveals the `.print-area`, so navigation never appears in output.
 */

export function printPage(): void {
  if (typeof window !== "undefined") window.print();
}
