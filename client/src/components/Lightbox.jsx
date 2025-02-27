// client/src/components/Lightbox.jsx
import React from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

const Lightbox = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const image = images[currentIndex];
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center animate-fade-in">
      <div className="relative">
        <img
          src={image.url}
          alt={image.labels.join(', ')}
          className="max-w-full max-h-screen rounded-lg shadow-xl"
        />
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-purple-700 text-purple-100 rounded-full hover:bg-purple-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {/* Previous Button */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-purple-700 text-purple-100 rounded-full hover:bg-purple-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {/* Next Button */}
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-purple-700 text-purple-100 rounded-full hover:bg-purple-600 transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Lightbox;
