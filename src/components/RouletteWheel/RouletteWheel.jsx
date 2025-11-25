import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import styles from './RouletteWheel.module.css';

const COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#607D8B'
];

const RouletteWheel = forwardRef(({ items, onFinished }, ref) => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const currentRotation = useRef(0);
  const spinVelocity = useRef(0);
  const animationFrameId = useRef(null);
  
  // Drag state
  const isDragging = useRef(false);
  const lastMouseAngle = useRef(0);
  const dragVelocity = useRef(0);
  const lastDragTime = useRef(0);
  const dragHistory = useRef([]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    const numItems = items.length;
    const arcSize = (2 * Math.PI) / numItems;

    ctx.clearRect(0, 0, width, height);

    items.forEach((item, index) => {
      const angle = index * arcSize;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(item, radius - 20, 6);
      ctx.restore();
    });
  };

  useEffect(() => {
    drawWheel();
  }, [items]);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Randomize target
    const minSpins = 5;
    const maxSpins = 10;
    const randomSpins = Math.random() * (maxSpins - minSpins) + minSpins;
    const targetRotation = currentRotation.current + (randomSpins * 360);
    
    // Simple deceleration logic
    const duration = 5000; // ms
    const startTime = performance.now();
    const startRotation = currentRotation.current;
    
    // Easing function: easeOutCubic
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const newRotation = startRotation + (targetRotation - startRotation) * easedProgress;
      currentRotation.current = newRotation;
      setRotation(newRotation);

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const normalizedRotation = newRotation % 360;
        // Calculate winner
        // 0 degrees is at 3 o'clock in canvas arc by default? 
        // Actually we rotate the canvas div.
        // The pointer is usually at top (270 deg) or right (0 deg).
        // Let's assume pointer is at Right (0 deg) for simplicity of calculation, 
        // but visually we might place it at Top.
        // If we rotate the canvas by R degrees, the item at 0 is now at R.
        // We need to find which item is at the pointer angle.
        
        // Let's say pointer is at 0 (Right).
        // Item index i is at [i*arc, (i+1)*arc].
        // Rotated by R, it is at [i*arc + R, (i+1)*arc + R].
        // We want to find i such that 0 is in that range (modulo 360).
        // Actually, it's easier to think: effective angle = (360 - (R % 360)) % 360.
        // Then find which sector contains this angle.
        
        const numItems = items.length;
        const arcSizeDeg = 360 / numItems;
        // Adjust for pointer position. If pointer is at Right (0), and we draw starting from 0.
        // But usually 0 is 3 o'clock.
        // Let's assume pointer is at 270 (Top).
        // Then we check angle 270.
        // Effective angle on wheel = (270 - (R % 360) + 360) % 360.
        
        // Let's stick to a standard pointer at Top (270 degrees in canvas coords, or -90).
        // But CSS rotate starts from 0.
        
        // Let's calculate purely based on the total rotation.
        // Total rotation R.
        // The wheel rotates CLOCKWISE.
        // The item at index 0 starts at angle 0 (Right).
        // After R rotation, it is at R.
        // Pointer is at Top (270 deg or -90 deg).
        // We need to find i such that (i * arc + R) matches 270.
        // i * arc = 270 - R
        // i = (270 - R) / arc
        
        const degreesPerItem = 360 / numItems;
        // We need to normalize the result to [0, numItems-1]
        // (270 - R) might be negative.
        let winnerIndex = Math.floor(((270 - currentRotation.current) % 360 + 360) % 360 / degreesPerItem);
        
        if (onFinished) onFinished(items[winnerIndex]);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
  };

  useImperativeHandle(ref, () => ({
    spin
  }));

  // Calculate angle from center
  const getAngleFromCenter = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const handleMouseDown = (e) => {
    if (isSpinning) return;
    
    isDragging.current = true;
    lastMouseAngle.current = getAngleFromCenter(e);
    lastDragTime.current = performance.now();
    dragHistory.current = [];
    dragVelocity.current = 0;
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    
    const currentAngle = getAngleFromCenter(e);
    const currentTime = performance.now();
    let angleDelta = currentAngle - lastMouseAngle.current;
    
    // Handle angle wrap-around
    if (angleDelta > 180) angleDelta -= 360;
    if (angleDelta < -180) angleDelta += 360;
    
    const newRotation = currentRotation.current + angleDelta;
    currentRotation.current = newRotation;
    setRotation(newRotation);
    
    // Track velocity
    const timeDelta = currentTime - lastDragTime.current;
    if (timeDelta > 0) {
      const velocity = angleDelta / timeDelta;
      dragHistory.current.push({ velocity, time: currentTime });
      
      // Keep only recent history (last 100ms)
      dragHistory.current = dragHistory.current.filter(
        h => currentTime - h.time < 100
      );
    }
    
    lastMouseAngle.current = currentAngle;
    lastDragTime.current = currentTime;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    // Always start a spin when mouse is released
    setIsSpinning(true);
    
    // Randomize target
    const minSpins = 5;
    const maxSpins = 10;
    const randomSpins = Math.random() * (maxSpins - minSpins) + minSpins;
    const targetRotation = currentRotation.current + (randomSpins * 360);
    
    // Simple deceleration logic
    const duration = 5000; // ms
    const startTime = performance.now();
    const startRotation = currentRotation.current;
    
    // Easing function: easeOutCubic
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const newRotation = startRotation + (targetRotation - startRotation) * easedProgress;
      currentRotation.current = newRotation;
      setRotation(newRotation);

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        
        // Calculate winner
        const numItems = items.length;
        const degreesPerItem = 360 / numItems;
        let winnerIndex = Math.floor(((270 - currentRotation.current) % 360 + 360) % 360 / degreesPerItem);
        
        if (onFinished) onFinished(items[winnerIndex]);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
  };



  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    if (isDragging.current) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.pointer} />
      <div 
        className={styles.wheel} 
        style={{ transform: `rotate(${rotation}deg)` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={500} 
          className={styles.canvas}
        />
      </div>
    </div>
  );
});

export default RouletteWheel;
