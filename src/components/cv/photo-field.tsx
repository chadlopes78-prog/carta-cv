import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Camera, ImagePlus, RotateCcw, RotateCw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { PersonalInfo } from "@/lib/resume/types";
import {
  PHOTO_ACCEPT,
  PHOTO_FRAME,
  displayPhoto,
  loadImage,
  normalizePersonal,
  readFileAsDataUrl,
  renderCroppedPhoto,
  storeOriginal,
  validatePhotoFile,
} from "@/lib/resume/photo";

type Props = {
  personal: PersonalInfo;
  showPhoto: boolean;
  onPersonal: (partial: Partial<PersonalInfo>) => void;
  onShowPhoto: (value: boolean) => void;
};

export function PhotoField({ personal, showPhoto, onPersonal, onShowPhoto }: Props) {
  const p = normalizePersonal(personal);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const preview = displayPhoto(p);

  async function pick(file: File | undefined) {
    if (!file) return;
    const msg = validatePhotoFile(file);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    try {
      const raw = await readFileAsDataUrl(file);
      const stored = await storeOriginal(raw);
      onPersonal({ photo: stored });
      setEditorSrc(stored);
    } catch {
      setError("Não foi possível ler a fotografia. Tenta outra.");
    }
  }

  function onFiles(list: FileList | null) {
    void pick(list?.[0]);
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink">Foto de perfil</p>
      <p className="mt-1 text-xs text-muted">Escolhe uma fotografia profissional para o teu CV</p>

      {!preview && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            onFiles(e.dataTransfer.files);
          }}
          className={cn(
            "mt-3 rounded-lg border border-dashed bg-cream p-5 text-center",
            drag ? "border-forest bg-forest-soft" : "border-line",
          )}
        >
          <Upload className="mx-auto size-6 text-forest" />
          <p className="mt-2 text-sm text-ink">Adicionar foto</p>
          <p className="mt-1 text-xs text-muted">JPG, PNG ou WEBP · até 8 MB · arrasta para aqui no computador</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button type="button" size="sm" onClick={() => galleryRef.current?.click()}>
              <ImagePlus className="size-4" /> Galeria
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => cameraRef.current?.click()}>
              <Camera className="size-4" /> Câmara
            </Button>
          </div>
        </div>
      )}

      {preview && (
        <div className="mt-3 flex items-center gap-4 rounded-lg border border-line bg-cream p-3">
          <img
            src={preview}
            alt="Pré-visualização da foto"
            className={cn("size-20 object-cover outline outline-1 -outline-offset-1 outline-ink/10", p.photoShape === "square" ? "rounded-md" : "rounded-full")}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Fotografia no CV</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setEditorSrc(p.photo || preview)}>
                Ajustar
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => galleryRef.current?.click()}>
                Alterar foto
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  onPersonal({
                    photo: null,
                    photoUrl: null,
                    photoCrop: { x: 0, y: 0 },
                    photoPosition: { x: 0, y: 0 },
                    photoZoom: 1.15,
                    photoRotate: 0,
                  });
                }}
              >
                <Trash2 className="size-4" /> Remover
              </Button>
            </div>
          </div>
        </div>
      )}

      <label className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-md border border-line bg-cream px-3 py-2 text-sm">
        <span>Mostrar foto no CV</span>
        <button
          type="button"
          role="switch"
          aria-checked={showPhoto && p.photoEnabled}
          onClick={() => {
            const next = !(showPhoto && p.photoEnabled);
            onPersonal({ photoEnabled: next });
            onShowPhoto(next);
          }}
          className={cn("relative h-7 w-12 rounded-full transition-colors", showPhoto && p.photoEnabled ? "bg-forest" : "bg-line")}
        >
          <span className={cn("absolute top-0.5 size-6 rounded-full bg-cream transition-transform", showPhoto && p.photoEnabled ? "left-5" : "left-0.5")} />
        </button>
      </label>
      <p className="mt-1 text-xs text-muted">
        Desligada, a fotografia fica guardada mas não aparece no CV. No modelo ATS podes deixá-la oculta.
      </p>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <input
        ref={galleryRef}
        type="file"
        accept={PHOTO_ACCEPT}
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={PHOTO_ACCEPT}
        capture="environment"
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {editorSrc && (
        <PhotoEditor
          src={editorSrc}
          initial={p}
          onCancel={() => setEditorSrc(null)}
          onApply={async (next) => {
            const url = await renderCroppedPhoto(editorSrc, {
              x: next.photoPosition.x,
              y: next.photoPosition.y,
              zoom: next.photoZoom,
              rotate: next.photoRotate,
              shape: next.photoShape,
            });
            onPersonal({
              photo: editorSrc,
              photoUrl: url,
              photoEnabled: true,
              photoCrop: { x: next.photoPosition.x, y: next.photoPosition.y },
              photoPosition: next.photoPosition,
              photoZoom: next.photoZoom,
              photoRotate: next.photoRotate,
              photoShape: next.photoShape,
            });
            onShowPhoto(true);
            setEditorSrc(null);
          }}
        />
      )}
    </div>
  );
}

function PhotoEditor({
  src,
  initial,
  onCancel,
  onApply,
}: {
  src: string;
  initial: PersonalInfo;
  onCancel: () => void;
  onApply: (next: Pick<PersonalInfo, "photoPosition" | "photoZoom" | "photoRotate" | "photoShape">) => void;
}) {
  const [pos, setPos] = useState(() => {
    const p = initial.photoPosition ?? { x: 0, y: 0 };
    return p;
  });
  const [zoom, setZoom] = useState(initial.photoZoom || 1.15);
  const [rotate, setRotate] = useState(initial.photoRotate || 0);
  const [shape, setShape] = useState<"circle" | "square">(initial.photoShape === "square" ? "square" : "circle");
  const [cover, setCover] = useState(1);
  const [frame, setFrame] = useState(PHOTO_FRAME);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const apply = () => setFrame(el.clientWidth || PHOTO_FRAME);
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    void loadImage(src).then((img) => {
      setCover(Math.max(frame / img.width, frame / img.height));
    });
  }, [src, frame]);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setPos({
      x: drag.current.px + (e.clientX - drag.current.x),
      y: drag.current.py + (e.clientY - drag.current.y),
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/50 p-0 sm:place-items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-cream p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-card sm:rounded-lg">
        <h3 className="font-display text-xl">Ajustar fotografia</h3>
        <p className="mt-1 text-xs text-muted">Arrasta para posicionar o rosto. Usa o zoom e a rotação se precisares.</p>
        <div className="mt-4 flex justify-center">
          <div
            ref={box}
            className={cn(
              "relative aspect-square w-full max-w-[min(280px,calc(100vw-2.5rem))] overflow-hidden bg-paper touch-none",
              shape === "circle" ? "rounded-full" : "rounded-md",
            )}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotate(${rotate}deg) scale(${cover * zoom})`,
              }}
            />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 text-sm">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-11 flex-1 accent-forest"
            />
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setRotate((r) => r - 90)}>
              <RotateCcw className="size-4" /> Girar
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setRotate((r) => r + 90)}>
              <RotateCw className="size-4" /> Girar
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShape("circle")}
              className={cn("h-11 rounded-md text-sm", shape === "circle" ? "bg-ink text-cream" : "bg-paper ring-1 ring-line")}
            >
              Círculo
            </button>
            <button
              type="button"
              onClick={() => setShape("square")}
              className={cn("h-11 rounded-md text-sm", shape === "square" ? "bg-ink text-cream" : "bg-paper ring-1 ring-line")}
            >
              Quadrado
            </button>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() =>
              onApply({
                photoPosition: {
                  x: pos.x * (PHOTO_FRAME / frame),
                  y: pos.y * (PHOTO_FRAME / frame),
                },
                photoZoom: zoom,
                photoRotate: rotate,
                photoShape: shape,
              })
            }
          >
            Aplicar no CV
          </Button>
        </div>
      </div>
    </div>
  );
}
