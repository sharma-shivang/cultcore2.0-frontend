'use client';

import { useState } from 'react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageGalleryManagerProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
}

export default function ImageGalleryManager({
    images,
    onImagesChange,
    maxImages = 8
}: ImageGalleryManagerProps) {
    const [newUrl, setNewUrl] = useState('');
    const [error, setError] = useState('');

    const addImage = () => {
        setError('');
        if (!newUrl.trim()) return;

        try {
            const url = new URL(newUrl);
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Invalid protocol');
            }
        } catch (e) {
            setError('Please enter a valid URL (starting with http:// or https://)');
            return;
        }

        if (images.includes(newUrl.trim())) {
            setError('This image is already in the gallery');
            return;
        }

        if (images.length >= maxImages) {
            setError(`Max ${maxImages} images allowed`);
            return;
        }

        onImagesChange([...images, newUrl.trim()]);
        setNewUrl('');
    };

    const removeImage = (index: number) => {
        const updated = [...images];
        updated.splice(index, 1);
        onImagesChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="Paste image URL here..."
                        className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-foreground text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    />
                </div>
                <button
                    type="button"
                    onClick={addImage}
                    disabled={!newUrl.trim() || images.length >= maxImages}
                    className="bg-primary/10 hover:bg-primary/20 text-foreground px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                    <Plus size={18} />
                    Add
                </button>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-primary/10 bg-primary/5 group">
                        <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/000000/FFFFFF/png?text=Invalid+URL';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                            <X size={14} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-0.5 text-center">
                            Image {index + 1}
                        </div>
                    </div>
                ))}

                {images.length === 0 && (
                    <div className="col-span-full py-8 border-2 border-dashed border-primary/10 rounded-2xl flex flex-col items-center justify-center text-secondary-text">
                        <ImageIcon size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">No images added yet</p>
                    </div>
                )}
            </div>
            <p className="text-xs text-secondary-text">
                {images.length} / {maxImages} images added. Use high-quality URLs for better performance.
            </p>
        </div>
    );
}
