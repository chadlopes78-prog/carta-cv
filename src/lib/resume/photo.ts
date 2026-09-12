import type { PersonalInfo } from "./types";

export const PHOTO_MAX_BYTES = 8 * 1024 * 1024;
export const PHOTO_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
export const PHOTO_FRAME = 280;
export const PHOTO_OUTPUT = 800;

export const defaultPhotoFields = (): Pick<
  PersonalInfo,
  | "photo"
  | "photoUrl"
  | "photoEnabled"
  | "photoCrop"
  | "photoPosition"
  | "photoZoom"
  | "photoRotate"
  | "photoShape"
> => ({
  photo: null,
  photoUrl: null,
  photoEnabled: true,
  photoCrop: { x: 0, y: 0 },
  photoPosition: { x: 0, y: 0 },
  photoZoom: 1.15,
  photoRotate: 0,
  photoShape: "circle",
});

export function normalizePersonal(p: PersonalInfo): PersonalInfo {
  const d = defaultPhotoFields();
  return {
    ...d,
    ...p,
    photo: p.photo ?? null,
    photoUrl: p.photoUrl ?? p.photo ?? null,
    photoEnabled: p.photoEnabled ?? true,
    photoCrop: p.photoCrop ?? d.photoCrop,
    photoPosition: p.photoPosition ?? p.photoCrop ?? d.photoPosition,
    photoZoom: p.photoZoom ?? 1.15,
    photoRotate: p.photoRotate ?? 0,
    photoShape: p.photoShape === "square" ? "square" : "circle",
  };
}

export function displayPhoto(p: PersonalInfo): string | null {
  return p.photoUrl || p.photo || null;
}

export function photoVisible(p: PersonalInfo, showPhoto: boolean): boolean {
  const n = normalizePersonal(p);
  return Boolean(showPhoto && n.photoEnabled && displayPhoto(n));
}

export function validatePhotoFile(file: File): string | null {
  const okType = /image\/(jpeg|jpg|png|webp)/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!okType) return "Usa uma fotografia JPG, PNG ou WEBP.";
  if (file.size > PHOTO_MAX_BYTES) return "A fotografia é demasiado grande. Escolhe uma até 8 MB.";
  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Não foi possível ler a fotografia."));
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Fotografia inválida."));
    img.src = src;
  });
}

/** Downscale the original for storage / re-edit, without cropping. */
export async function storeOriginal(src: string): Promise<string> {
  const img = await loadImage(src);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

export async function renderCroppedPhoto(
  src: string,
  opts: { x: number; y: number; zoom: number; rotate: number; shape: "circle" | "square" },
): Promise<string> {
  const img = await loadImage(src);
  const out = PHOTO_OUTPUT;
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, out, out);
  ctx.save();
  if (opts.shape === "circle") {
    ctx.beginPath();
    ctx.arc(out / 2, out / 2, out / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }
  const cover = Math.max(PHOTO_FRAME / img.width, PHOTO_FRAME / img.height);
  const ratio = out / PHOTO_FRAME;
  ctx.translate(out / 2, out / 2);
  ctx.rotate((opts.rotate * Math.PI) / 180);
  ctx.translate(opts.x * ratio, opts.y * ratio);
  ctx.scale(cover * opts.zoom * ratio, cover * opts.zoom * ratio);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
  return canvas.toDataURL("image/jpeg", 0.9);
}
