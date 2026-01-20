// =============================================
// File Upload Component
// =============================================
// Drag & drop file upload with validation

'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';
import { APP_CONTENT } from '@/config/content';

// Supported file extensions (defined here to avoid importing server-only modules)
const SUPPORTED_EXTENSIONS = ['pptx', 'ppt', 'pdf'] as const;

// Check if a file extension is supported
function isSupportedFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return SUPPORTED_EXTENSIONS.includes(ext as typeof SUPPORTED_EXTENSIONS[number]);
}

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  isLoading = false,
  error = null,
  className,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setDragError(null);

      // Check for rejected files
      if (rejectedFiles.length > 0) {
        setDragError('Please upload a supported file type');
        return;
      }

      // Get the first file
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file type
      if (!isSupportedFile(file.name)) {
        setDragError(
          `Unsupported file type. Please upload: ${SUPPORTED_EXTENSIONS.join(', ')}`
        );
        return;
      }

      // Store and pass the file
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: isLoading,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/pdf': ['.pdf'],
    },
  });

  // Combine errors
  const displayError = error || dragError;

  return (
    <div className={cn('w-full', className)}>
      {/* Dropzone area */}
      <div
        {...getRootProps()}
        className={cn(
          // Base styles
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer',
          'transition-all duration-200 ease-in-out',
          // Default state
          'border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5',
          // Hover state
          'hover:border-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10',
          // Active drag state
          isDragActive && 'border-primary bg-primary/10 scale-[1.02]',
          // Error state
          displayError && 'border-red-400 bg-red-50',
          // Loading state
          isLoading && 'opacity-50 cursor-wait'
        )}
      >
        <input {...getInputProps()} />

        {/* Upload icon */}
        <div className="text-5xl mb-4">
          {isLoading ? '⏳' : selectedFile ? '✅' : '📄'}
        </div>

        {/* Main text */}
        {isLoading ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Processing your file...
            </h3>
            <p className="text-gray-500">This may take a moment</p>
          </div>
        ) : selectedFile ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {selectedFile.name}
            </h3>
            <p className="text-gray-500">
              {formatFileSize(selectedFile.size)} • Click or drop to change
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {isDragActive
                ? 'Drop it here!'
                : APP_CONTENT.upload.title}
            </h3>
            <p className="text-gray-500">
              or{' '}
              <span className="text-primary font-medium underline">
                {APP_CONTENT.upload.subtitle.replace('or ', '')}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Supported formats */}
      <div className="flex justify-center gap-2 mt-4">
        {APP_CONTENT.upload.supportedFormats.map((format) => (
          <span
            key={format}
            className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full"
          >
            {format}
          </span>
        ))}
      </div>

      {/* Error message */}
      {displayError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 text-center">{displayError}</p>
        </div>
      )}
    </div>
  );
}
