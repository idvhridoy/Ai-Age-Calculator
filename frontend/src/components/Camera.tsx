import React, { useRef, useEffect, useState } from 'react';
import styles from './Camera.module.css';

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    if (isCapturing) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCapturing]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        setIsCapturing(false);
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setIsCapturing(true);
  };

  return (
    <div className={styles.cameraContainer}>
      {!isCapturing && !capturedImage && (
        <button 
          className={styles.startButton}
          onClick={() => setIsCapturing(true)}
        >
          Start Camera
        </button>
      )}

      {isCapturing && (
        <div className={styles.cameraView}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={styles.video}
          />
          <button 
            className={styles.captureButton}
            onClick={captureImage}
          >
            Capture
          </button>
        </div>
      )}

      {capturedImage && (
        <div className={styles.capturedView}>
          <img 
            src={capturedImage} 
            alt="Captured" 
            className={styles.capturedImage}
          />
          <div className={styles.buttonGroup}>
            <button 
              className={styles.retakeButton}
              onClick={retake}
            >
              Retake
            </button>
            <button 
              className={styles.useButton}
              onClick={() => {/* TODO: Handle image processing */}}
            >
              Use Photo
            </button>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Camera;
