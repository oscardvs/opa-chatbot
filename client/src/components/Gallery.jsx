// client/src/components/Gallery.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { imagesData } from '../utils/imagesData';
import Lightbox from './Lightbox';

const Gallery = ({ onClose }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goToPrev = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setLightboxIndex((prev) =>
      prev < imagesData.length - 1 ? prev + 1 : prev
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-70 backdrop-blur-sm flex flex-col">
      {/* Header with Close Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          className="flex items-center justify-center p-2 text-purple-100 hover:text-purple-300 transition-colors focus:outline-none"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Gallery Grid */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imagesData.map((item, index) => (
            <div
              key={index}
              className="bg-purple-800 rounded-lg p-2 shadow-lg cursor-pointer hover:scale-105 transition-transform"
              onClick={() => openLightbox(index)}
            >
              <img
                src={item.url}
                alt={item.labels.join(', ')}
                className="object-cover w-full h-48 rounded"
              />
              <p className="mt-2 text-center text-sm text-purple-200">
                {item.labels.join(' / ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Render Lightbox if an image is selected */}
      {lightboxIndex !== null && (
        <Lightbox
          images={imagesData}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={lightboxIndex > 0 ? goToPrev : null}
          onNext={lightboxIndex < imagesData.length - 1 ? goToNext : null}
        />
      )}
    </div>
  );
};

export default Gallery;
