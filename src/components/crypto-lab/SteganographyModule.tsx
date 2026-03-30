import { useState, useRef } from 'react';
import { 
  loadImageData, 
  embedMessage, 
  extractMessage, 
  calculateCapacity,
  canvasToBlob,
  downloadBlob 
} from '@/utils/steganography';

const SteganographyModule = () => {
  const [mode, setMode] = useState<'embed' | 'extract'>('embed');
  const [message, setMessage] = useState('');
  const [extractedMessage, setExtractedMessage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);
    setSuccess(null);
    setExtractedMessage(null);

    try {
      const { imageData, canvas } = await loadImageData(file);
      canvasRef.current = canvas;
      setOriginalImage(canvas.toDataURL());
      setCapacity(calculateCapacity(imageData.width, imageData.height));
      setStegoImage(null);
    } catch (err) {
      setError('Failed to load image');
      console.error(err);
    }
  };

  const handleEmbed = async () => {
    if (!canvasRef.current || !message.trim()) {
      setError('Please select an image and enter a message');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const modifiedData = embedMessage(imageData, message);
      
      ctx.putImageData(modifiedData, 0, 0);
      setStegoImage(canvasRef.current.toDataURL());
      setSuccess('Message embedded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to embed message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!canvasRef.current) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedMessage(null);

    try {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const extracted = extractMessage(imageData);
      
      if (extracted) {
        setExtractedMessage(extracted);
        setSuccess('Hidden message extracted!');
      } else {
        setError('No hidden message found in this image');
      }
    } catch (err) {
      setError('Failed to extract message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await canvasToBlob(canvasRef.current);
      downloadBlob(blob, 'stego-image.png');
    } catch (err) {
      setError('Failed to download image');
    }
  };

  return (
    <div className="crypto-lab-container">
      <div className="crypto-buttons" style={{ marginBottom: '1rem' }}>
        <button
          className={`crypto-btn ${mode === 'embed' ? '' : 'crypto-btn-secondary'}`}
          onClick={() => setMode('embed')}
        >
          <i className="fa-solid fa-eye-slash"></i>
          Hide Message
        </button>
        <button
          className={`crypto-btn ${mode === 'extract' ? '' : 'crypto-btn-secondary'}`}
          onClick={() => setMode('extract')}
        >
          <i className="fa-solid fa-eye"></i>
          Extract Message
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div 
        className="file-upload-area"
        onClick={() => fileInputRef.current?.click()}
      >
        <i className="fa-solid fa-cloud-upload-alt"></i>
        <p>Click to upload an image (PNG recommended)</p>
        {capacity && (
          <p style={{ fontSize: '0.75rem', color: 'var(--primary-hex)' }}>
            Capacity: {capacity} characters
          </p>
        )}
      </div>

      {mode === 'embed' && (
        <div className="crypto-input-group">
          <label>Secret Message to Hide</label>
          <textarea
            className="crypto-input crypto-textarea"
            placeholder="Enter message to hide in image..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={capacity || undefined}
          />
          {capacity && (
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
              {message.length} / {capacity} characters
            </span>
          )}
        </div>
      )}

      {originalImage && (
        <div className="steganography-preview">
          <div className="stego-image-box">
            <h4>Original Image</h4>
            <img src={originalImage} alt="Original" />
          </div>
          {stegoImage && (
            <div className="stego-image-box">
              <h4>Stego Image</h4>
              <img src={stegoImage} alt="With hidden message" />
            </div>
          )}
        </div>
      )}

      <div className="crypto-buttons">
        {mode === 'embed' ? (
          <>
            <button
              className="crypto-btn"
              onClick={handleEmbed}
              disabled={isLoading || !originalImage}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Embedding...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-mask"></i>
                  Embed Message
                </>
              )}
            </button>
            {stegoImage && (
              <button className="crypto-btn crypto-btn-secondary" onClick={handleDownload}>
                <i className="fa-solid fa-download"></i>
                Download
              </button>
            )}
          </>
        ) : (
          <button
            className="crypto-btn"
            onClick={handleExtract}
            disabled={isLoading || !originalImage}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Extracting...
              </>
            ) : (
              <>
                <i className="fa-solid fa-search"></i>
                Extract Hidden Message
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="crypto-status error">
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="crypto-status success">
          <i className="fa-solid fa-check-circle"></i>
          {success}
        </div>
      )}

      {extractedMessage && (
        <div className="crypto-output">
          <span className="crypto-output-label">Extracted Hidden Message</span>
          {extractedMessage}
        </div>
      )}
    </div>
  );
};

export default SteganographyModule;
