import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoCaptureProps {
  onCapture: (file: File) => void;
  isAnalyzing: boolean;
  analyzeStep: string | null;
}

export function PhotoCapture({ onCapture, isAnalyzing, analyzeStep }: PhotoCaptureProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const capturedFileRef = useRef<File | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  }, [stream]);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'captured-food.jpg', { type: 'image/jpeg' });
        capturedFileRef.current = file;
        setPreviewUrl(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      capturedFileRef.current = file;
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    capturedFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = () => {
    if (capturedFileRef.current) {
      onCapture(capturedFileRef.current);
    }
  };

  const stepMessages = {
    uploading: 'Uploading image...',
    analyzing: 'Analyzing sugar content...',
    saving: 'Saving results...',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Camera/Preview Area */}
      <div className="flex-1 relative bg-muted rounded-2xl overflow-hidden">
        {isCameraOpen ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-primary/50 rounded-2xl" />
            </div>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <Button
                variant="secondary"
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={stopCamera}
              >
                <X className="w-6 h-6" />
              </Button>
              <Button
                size="icon"
                className="w-16 h-16 rounded-full gradient-primary shadow-soft"
                onClick={capturePhoto}
              >
                <Camera className="w-8 h-8" />
              </Button>
            </div>
          </>
        ) : previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Food preview"
              className="w-full h-full object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-foreground font-medium">
                  {stepMessages[analyzeStep as keyof typeof stepMessages] || 'Processing...'}
                </p>
              </div>
            )}
            {!isAnalyzing && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 w-10 h-10 rounded-full"
                onClick={clearPreview}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-12 h-12 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Capture Your Food
              </h3>
              <p className="text-sm text-muted-foreground">
                Take a photo or upload an image to analyze sugar content
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isCameraOpen && (
        <div className="mt-6 space-y-3">
          {previewUrl ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearPreview}
                disabled={isAnalyzing}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button
                className="flex-1 gradient-primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Sugar'}
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button
                className="flex-1 gradient-primary shadow-soft"
                onClick={startCamera}
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </Button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
