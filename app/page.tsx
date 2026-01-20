// =============================================
// Home Page
// =============================================
// Landing page with file upload and daily verse

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { APP_CONTENT } from '@/config/content';
import { QUESTION_TYPES } from '@/config/questions';
import FileUpload from '@/components/FileUpload';
import VerseCard from '@/components/VerseCard';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  // Handle continue to configure
  const handleContinue = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create form data with the file
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Upload and parse the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload file');
      }

      // Store the parsed content in sessionStorage for the configure page
      sessionStorage.setItem('uploadedContent', JSON.stringify({
        filename: selectedFile.name,
        content: data.content,
        metadata: data.metadata,
      }));

      // Navigate to configure page
      router.push('/configure');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-8 animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
          {APP_CONTENT.tagline}
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          {APP_CONTENT.subtitle}
        </p>
      </section>

      {/* Daily Bible Verse */}
      <section className="max-w-xl mx-auto mb-8 animate-slideUp">
        <VerseCard />
      </section>

      {/* Upload Card */}
      <section className="max-w-xl mx-auto mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <FileUpload
            onFileSelect={handleFileSelect}
            isLoading={isUploading}
            error={error}
          />

          {/* Continue button */}
          {selectedFile && (
            <div className="mt-6">
              <Button
                onClick={handleContinue}
                isLoading={isUploading}
                size="lg"
                className="w-full"
              >
                {isUploading ? 'Processing...' : 'Continue to Quiz Settings'}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* History button */}
      <section className="text-center mb-12 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        <Link href="/history">
          <Button variant="outline" leftIcon={<span>📋</span>}>
            {APP_CONTENT.buttons.viewHistory}
          </Button>
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp" style={{ animationDelay: '0.3s' }}>
        {Object.values(QUESTION_TYPES)
          .filter((type) => type.id !== 'mixed')
          .map((type) => (
            <div
              key={type.id}
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-4xl mb-4 block">{type.icon}</span>
              <h3 className="font-semibold text-gray-900 mb-2">{type.name}</h3>
              <p className="text-sm text-gray-500">{type.description}</p>
            </div>
          ))}
      </section>
    </div>
  );
}
