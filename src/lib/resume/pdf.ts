export async function downloadCvPdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
  });
  const img = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = 210;
  const pageH = 297;
  const imgW = pageW;
  const imgH = (canvas.height * pageW) / canvas.width;
  let remaining = imgH;
  let position = 0;
  pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
  remaining -= pageH;
  while (remaining > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
    remaining -= pageH;
  }
  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

export function printCv() {
  window.print();
}
