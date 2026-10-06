"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react";

interface ImageGalleryProps {
  images: { file_path: string }[];
  title?: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -(clientWidth - 100) : clientWidth - 100;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="relative group/gallery">
      <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
        <ImageIcon className="w-6 h-6 text-primary-500" />
        {title || "Galeria de Imagens"}
      </h2>
      
      <div className="relative">
        {/* Seta Esquerda */}
        <button 
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-black/50 opacity-0 group-hover/gallery:opacity-100 hover:bg-black/80 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm -ml-4 rounded-r-lg"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide scroll-smooth"
        >
          {images.slice(0, 15).map((image, index) => (
            <div 
              key={index} 
              className="min-w-[280px] max-w-[280px] md:min-w-[400px] md:max-w-[400px] aspect-video relative rounded-xl overflow-hidden snap-start shrink-0 ring-1 ring-zinc-800 cursor-pointer group"
              onClick={() => setSelectedImage(image.file_path)}
            >
              <Image
                src={`https://image.tmdb.org/t/p/w780${image.file_path}`}
                alt={`Imagem ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>

        {/* Seta Direita */}
        <button 
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-black/50 opacity-0 group-hover/gallery:opacity-100 hover:bg-black/80 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm -mr-4 rounded-l-lg"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* MODAL FULLSCREEN */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
          <button 
            className="absolute top-6 right-6 p-2 bg-zinc-900/80 rounded-full hover:bg-zinc-800 text-white transition-colors z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full max-w-6xl aspect-video rounded-lg overflow-hidden shadow-2xl">
            <Image
              src={`https://image.tmdb.org/t/p/original${selectedImage}`}
              alt="Imagem em tamanho real"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
