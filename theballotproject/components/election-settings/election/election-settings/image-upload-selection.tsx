import React, { useState, useRef } from 'react';
import { Upload, Link2, X, FileImage } from 'lucide-react';

interface ImageUploadSectionProps {
  imageUrl: string | null | undefined;
  imageFile: string | null | undefined;
  onChange: (type: 'url' | 'file', value: string) => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  imageUrl,
  imageFile,
  onChange
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>(
    imageUrl ? 'url' : 'file'
  );
  const [urlInput, setUrlInput] = useState(imageUrl || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BASE_MEDIA_URL = "http://localhost:8000/media/";

  const resolveImage = () => {
    if (imageFile) {
      if (imageFile.startsWith("data:")) {
        // base64 (upload local)
        return imageFile;
      } else {
        // image sauvegardée sur le serveur
        return `${BASE_MEDIA_URL}${imageFile}`;
      }
    }
    return imageUrl || null;
  };

  const currentImage = resolveImage();
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange('url', urlInput.trim());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange('file', reader.result);
        }
      };
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange('file', reader.result);
        }
      };
    }
  };

  const handleRemoveImage = () => {
    onChange('url', '');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">


      {/* Image preview */}
      {currentImage && (
        <div className="relative mb-4 overflow-hidden rounded-lg">
          <img
            src={currentImage}
            alt="Aperçu de l'image"
            className="w-full h-[200px] object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 transition-colors"
            aria-label="Supprimer l'image"
          >
            <X size={20} className="text-red-500" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'file'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('file')}
        >
          <span className="flex items-center gap-1">
            <Upload size={16} />
            Télécharger un fichier
          </span>
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'url'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('url')}
        >
          <span className="flex items-center gap-1">
            <Link2 size={16} />
            Utiliser une URL
          </span>
        </button>
      </div>

      {/* File upload area */}
      {activeTab === 'file' && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}
            transition-colors cursor-pointer
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <FileImage size={40} className="text-gray-400" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">Glissez et déposez une image</p>
              <p>ou <span className="text-blue-600">parcourez vos fichiers</span></p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG ou GIF (max. 5MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* URL input */}
      {activeTab === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadSection;