import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ViolationType, Violation } from '@/data/violations';

interface ProctoringState {
  isActive: boolean;
  webcamStream: MediaStream | null;
  screenStream: MediaStream | null;
  audioStream: MediaStream | null;
  isFullscreen: boolean;
  violations: Violation[];
  warningCount: number;
  isTerminated: boolean;
  faceDetected: boolean;
  multipleFaces: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  lastViolation: Violation | null;
}

interface ProctoringCallbacks {
  onViolation: (violation: Violation) => void;
  onTerminate: (violations: Violation[]) => void;
  onWarning: (warningCount: number) => void;
}

const MAX_WARNINGS = 3;
const NOISE_THRESHOLD = 50; // Audio level threshold for background noise

export function useProctoring(callbacks?: ProctoringCallbacks) {
  const [state, setState] = useState<ProctoringState>({
    isActive: false,
    webcamStream: null,
    screenStream: null,
    audioStream: null,
    isFullscreen: false,
    violations: [],
    warningCount: 0,
    isTerminated: false,
    faceDetected: true,
    multipleFaces: false,
    cameraEnabled: false,
    microphoneEnabled: false,
    lastViolation: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const noiseCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const delayedPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const noFaceCountRef = useRef(0);

  // Add violation
  const addViolation = useCallback((type: ViolationType, description: string, severity: 'warning' | 'critical' = 'warning') => {
    const violation: Violation = {
      type,
      timestamp: new Date(),
      description,
      severity,
    };

    setState(prev => {
      // For critical violations, jump straight to max warnings to ensure termination
      const newWarningCount = severity === 'critical' ? MAX_WARNINGS : prev.warningCount + 1;
      const isTerminated = newWarningCount >= MAX_WARNINGS;

      // Schedule toast and callbacks outside of setState to avoid updating state during render
      queueMicrotask(() => {
        if (isTerminated && !prev.isTerminated) {
          toast.error('Test terminated due to severe violation!', { duration: 5000 });
          callbacks?.onTerminate([...prev.violations, violation]);
        } else if (!isTerminated) {
          toast.error(`⚠️ Warning ${newWarningCount}/${MAX_WARNINGS}: ${description}`, { duration: 4000 });
          callbacks?.onWarning(newWarningCount);
        }
        callbacks?.onViolation(violation);
      });

      return {
        ...prev,
        violations: [...prev.violations, violation],
        warningCount: newWarningCount,
        isTerminated,
        lastViolation: violation,
      };
    });
  }, [callbacks]);

  // Request fullscreen
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      setState(prev => ({ ...prev, isFullscreen: true }));
      return true;
    } catch (error) {
      console.error('Fullscreen error:', error);
      return false;
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      // Only try to exit fullscreen if document is active and in fullscreen mode
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        setState(prev => ({ ...prev, isFullscreen: false }));
        return;
      }
      
      // Check if document is active before attempting to exit fullscreen
      if (document.visibilityState !== 'visible') {
        setState(prev => ({ ...prev, isFullscreen: false }));
        return;
      }
      
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setState(prev => ({ ...prev, isFullscreen: false }));
    } catch (error) {
      // Silently handle - this can happen if document becomes inactive
      setState(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      
      setState(prev => {
        if (prev.isActive && prev.isFullscreen && !isCurrentlyFullscreen) {
          // Schedule violation and re-enter fullscreen outside of setState
          queueMicrotask(() => {
            // Treat exiting fullscreen as a critical violation to close the assessment
            addViolation('fullscreen_exit', 'Exited fullscreen mode during test', 'critical');
          });
        }
        return { ...prev, isFullscreen: isCurrentlyFullscreen };
      });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [addViolation, enterFullscreen]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (state.isActive && document.hidden) {
        addViolation('tab_switch', 'Switched tabs or minimized window');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isActive, addViolation]);

  // Handle keyboard shortcuts (copy, paste, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isActive) return;

      // Detect Ctrl/Cmd + C, V, A, P (copy, paste, select all, print)
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        addViolation('keyboard_shortcut', `Attempted to use ${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${e.key.toUpperCase()}`);
      }

      // Detect Alt+Tab attempt (won't fully prevent but can detect)
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        addViolation('tab_switch', 'Attempted to switch windows using Alt+Tab');
      }

      // Detect F12 (developer tools)
      if (e.key === 'F12') {
        e.preventDefault();
        addViolation('keyboard_shortcut', 'Attempted to open developer tools');
      }

      // Detect Escape (might try to exit fullscreen)
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (state.isActive) {
        e.preventDefault();
        addViolation('right_click', 'Attempted to right-click');
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      if (state.isActive) {
        e.preventDefault();
        addViolation('copy_paste', `Attempted to ${e.type}`);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
    };
  }, [state.isActive, addViolation]);

  // Initialize webcam
  const startWebcam = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      setState(prev => ({ ...prev, webcamStream: stream, cameraEnabled: true }));
      return stream;
    } catch (error) {
      console.error('Webcam error:', error);
      toast.error('Camera access required for proctored test');
      return null;
    }
  }, []);

  // Initialize microphone
  const startMicrophone = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setState(prev => ({ ...prev, audioStream: stream, microphoneEnabled: true }));

      // Set up audio analysis for noise detection
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      return stream;
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Microphone access required for proctored test');
      return null;
    }
  }, []);

  // Initialize screen recording
  const startScreenRecording = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });

      // Detect if screen sharing stops
      stream.getVideoTracks()[0].onended = () => {
        if (state.isActive) {
          addViolation('screen_share_stopped', 'Screen sharing was stopped', 'critical');
        }
      };

      setState(prev => ({ ...prev, screenStream: stream }));
      return stream;
    } catch (error) {
      console.error('Screen recording error:', error);
      toast.error('Screen sharing required for proctored test');
      return null;
    }
  }, [state.isActive, addViolation]);

  // Check for background noise
  const checkBackgroundNoise = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    if (average > NOISE_THRESHOLD) {
      addViolation('background_noise', 'Excessive background noise detected', 'warning');
    }
  }, [addViolation]);

  // Camera presence check - simplified to avoid false positives
  // Without a proper face detection library (face-api.js), we only check if camera is active
  // This prevents false "no face" violations while still ensuring camera is working
  const performFaceDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Ensure video is playing and has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      // Video not ready yet, don't count as failure
      return;
    }

    // Check if video stream is active
    const stream = video.srcObject as MediaStream;
    if (!stream || !stream.active) {
      noFaceCountRef.current++;
      if (noFaceCountRef.current >= 20) { // About 60 seconds at 3s interval
        setState(prev => ({ ...prev, faceDetected: false }));
        addViolation('camera_inactive', 'Camera stream inactive - please ensure camera is working');
        noFaceCountRef.current = 0;
      }
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simple check: is camera showing content (not completely black/covered)?
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let totalBrightness = 0;
    const sampleRate = 100; // Sample every 100th pixel for performance
    let sampledPixels = 0;

    for (let i = 0; i < data.length; i += 4 * sampleRate) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;
      sampledPixels++;
    }

    const avgBrightness = totalBrightness / sampledPixels;

    // Only check if camera is completely covered (very dark) or completely white
    // Otherwise, assume the student is present if camera is working
    const cameraCovered = avgBrightness < 5; // Completely black/covered
    const cameraOverexposed = avgBrightness > 252; // Completely white

    if (cameraCovered) {
      noFaceCountRef.current++;
      // Very generous - require 20 consecutive failures (60 seconds)
      if (noFaceCountRef.current >= 20) {
        setState(prev => ({ ...prev, faceDetected: false }));
        addViolation('camera_covered', 'Camera appears to be covered - please ensure camera has clear view');
        noFaceCountRef.current = 0;
      }
    } else if (cameraOverexposed) {
      // Don't add violation for overexposure, just log it
      console.log('Camera overexposed - brightness:', avgBrightness);
    } else {
      // Camera is working normally - assume face is present
      // Reset counter and mark as detected
      noFaceCountRef.current = 0;
      setState(prev => ({ ...prev, faceDetected: true, multipleFaces: false }));
    }
  }, [addViolation]);

  // Start proctoring system
  const startProctoring = useCallback(async (): Promise<boolean> => {
    toast.loading('Initializing proctoring system...', { id: 'proctor-init' });

    // Request fullscreen FIRST to preserve user gesture, then screen sharing
    // Many browsers require getDisplayMedia/requestFullscreen to be called within a user gesture.
    let screenStream: MediaStream | null = null;
    try {
      const fullscreenSuccess = await enterFullscreen();
      if (!fullscreenSuccess) {
        toast.error('Fullscreen required', { id: 'proctor-init' });
        return false;
      }

      screenStream = await startScreenRecording();
      if (!screenStream) {
        toast.error('Screen sharing denied', { id: 'proctor-init' });
        await exitFullscreen();
        return false;
      }
    } catch (err) {
      console.error('Screen/fullscreen initialization failed:', err);
      if (screenStream) screenStream.getTracks().forEach(t => t.stop());
      await exitFullscreen();
      toast.error('Screen sharing or fullscreen could not be started', { id: 'proctor-init' });
      return false;
    }

    // Request camera and microphone AFTER screen/fullscreen (still within the user gesture window)
    const webcamStream = await startWebcam();
    if (!webcamStream) {
      toast.error('Camera access denied', { id: 'proctor-init' });
      // stop screen if camera denied
      screenStream.getTracks().forEach(track => track.stop());
      return false;
    }

    const audioStream = await startMicrophone();
    if (!audioStream) {
      toast.error('Microphone access denied', { id: 'proctor-init' });
      webcamStream.getTracks().forEach(track => track.stop());
      screenStream.getTracks().forEach(track => track.stop());
      return false;
    }

    // Start face detection interval
    faceDetectionIntervalRef.current = setInterval(() => {
      performFaceDetection();
    }, 3000);

    // Start noise detection interval
    noiseCheckIntervalRef.current = setInterval(() => {
      checkBackgroundNoise();
    }, 5000);

    setState(prev => ({
      ...prev,
      isActive: true,
      webcamStream,
      audioStream,
      screenStream,
      isFullscreen: true,
      violations: [],
      warningCount: 0,
      isTerminated: false,
    }));

    toast.success('Proctoring system active', { id: 'proctor-init' });
    return true;
  }, [startWebcam, startMicrophone, startScreenRecording, enterFullscreen, performFaceDetection, checkBackgroundNoise]);

  // Stop proctoring system
  const stopProctoring = useCallback(async () => {
    // Stop all media streams
    state.webcamStream?.getTracks().forEach(track => track.stop());
    state.screenStream?.getTracks().forEach(track => track.stop());
    state.audioStream?.getTracks().forEach(track => track.stop());

    // Clean up audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.debug('AudioContext close error:', e);
      }
      audioContextRef.current = null;
    }

    // Clear intervals
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }
    if (noiseCheckIntervalRef.current) {
      clearInterval(noiseCheckIntervalRef.current);
      noiseCheckIntervalRef.current = null;
    }

    // Exit fullscreen
    await exitFullscreen();

    setState({
      isActive: false,
      webcamStream: null,
      screenStream: null,
      audioStream: null,
      isFullscreen: false,
      violations: state.violations,
      warningCount: 0,
      isTerminated: false,
      faceDetected: true,
      multipleFaces: false,
      cameraEnabled: false,
      microphoneEnabled: false,
      lastViolation: null,
    });

    toast.success('Proctoring session ended');
  }, [state.webcamStream, state.screenStream, state.audioStream, state.violations, exitFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      state.webcamStream?.getTracks().forEach(track => track.stop());
      state.screenStream?.getTracks().forEach(track => track.stop());
      state.audioStream?.getTracks().forEach(track => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (e) {
          // Ignore
        }
        audioContextRef.current = null;
      }
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
      }
      if (noiseCheckIntervalRef.current) {
        clearInterval(noiseCheckIntervalRef.current);
      }
      if (delayedPlayTimeoutRef.current) {
        clearTimeout(delayedPlayTimeoutRef.current);
      }
    };
  }, []);

  // Set video ref for face detection
  const setVideoElement = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (video && state.webcamStream) {
      video.srcObject = state.webcamStream;
      video.muted = true;
      video.playsInline = true;
      
      // Let the browser handle autoPlay natively to prevent unhandled promise rejections
      // on active state changes or unmounts. Just in case it's paused, we will silently try to play.
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silently catch AbortError to prevent browser console pollution
          });
        }
      }
    }
  }, [state.webcamStream]);

  // Set canvas ref for face detection
  const setCanvasElement = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  return {
    state,
    startProctoring,
    stopProctoring,
    enterFullscreen,
    exitFullscreen,
    addViolation,
    setVideoElement,
    setCanvasElement,
    MAX_WARNINGS,
  };
}

export type { ProctoringState, Violation };
