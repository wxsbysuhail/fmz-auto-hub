import React, { useRef } from "react";
import { Camera, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

export function PhotoUpload({ photos, onChange, max = 3 }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (photos.length >= max) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange([...photos, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const remove = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Upload Trigger - Prominent wide version when no photos */}
        {photos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative rounded-[2.5rem] border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-500 flex flex-col items-center justify-center gap-4 group overflow-hidden",
              photos.length === 0 ? "col-span-full py-12" : "aspect-square"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-[2rem] bg-background flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-1 relative z-10">
              <span className={cn(
                "font-black uppercase tracking-[0.3em] text-primary transition-all",
                photos.length === 0 ? "text-sm" : "text-[10px]"
              )}>
                {photos.length === 0 ? "Initialize Visual Intake" : "Add Photo"}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                Support for high-res JPEG/PNG · Max {max} Files
              </span>
            </div>
            
            {photos.length === 0 && (
              <div className="absolute bottom-4 flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1 w-8 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                ))}
              </div>
            )}
          </button>
        )}

        {/* Thumbnails */}
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-square rounded-[2rem] overflow-hidden border border-border/40 group anim-in shadow-xl hover:shadow-2xl transition-all duration-700">
            <img src={p} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(i); }}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 backdrop-blur-sm shadow-xl"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-3 text-[8px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">File {i+1}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 px-1">
        <div className="h-1.5 flex-1 bg-secondary/50 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-700" style={{ width: `${(photos.length / max) * 100}%` }} />
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black whitespace-nowrap">
          {photos.length} / {max} Evidence Captured
        </div>
      </div>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
