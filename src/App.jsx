import React, { useState, useRef } from 'react';
import RouletteWheel from './components/RouletteWheel/RouletteWheel';
import Controls from './components/Controls/Controls';
import ResultModal from './components/ResultModal/ResultModal';

function App() {
  const [mode, setMode] = useState('NUMBERS'); // 'NUMBERS' or 'CUSTOM'
  const [itemCount, setItemCount] = useState(10);
  const [customItemsText, setCustomItemsText] = useState('Apple\nBanana\nCherry\nDate\nElderberry');
  // Initialize with 1-10
  const [items, setItems] = useState(Array.from({ length: 10 }, (_, i) => (i + 1).toString()));
  const [removeOnWin, setRemoveOnWin] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const wheelRef = useRef(null);

  const generateNumberItems = (count) => {
    return Array.from({ length: count }, (_, i) => (i + 1).toString());
  };

  const generateCustomItems = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.length > 0 ? lines : ['Empty'];
  };

  const handleCountChange = (newCount) => {
    setItemCount(newCount);
    if (mode === 'NUMBERS') {
      setItems(generateNumberItems(newCount));
    }
  };

  const handleCustomTextChange = (newText) => {
    setCustomItemsText(newText);
    if (mode === 'CUSTOM') {
      setItems(generateCustomItems(newText));
    }
  };

  const handleModeChange = (isCustom) => {
    const newMode = isCustom ? 'CUSTOM' : 'NUMBERS';
    setMode(newMode);
    if (newMode === 'NUMBERS') {
      setItems(generateNumberItems(itemCount));
    } else {
      setItems(generateCustomItems(customItemsText));
    }
  };

  const handleSpin = () => {
    if (items.length < 2) {
      alert('Need at least 2 items to spin!');
      return;
    }
    setIsSpinning(true);
    setWinner(null);
    if (wheelRef.current) {
      wheelRef.current.spin();
    }
  };

  const handleSpinFinished = (result) => {
    setIsSpinning(false);
    setWinner(result);

    if (removeOnWin) {
      if (mode === 'NUMBERS') {
        const newItems = items.filter(item => item !== result);
        setItems(newItems);
        // We update the count display, but we DO NOT regenerate the items
        // This means the "Count" input might show "9" but the items are "1,3,4..." (not 1-9)
        // This is acceptable behavior for "Remove on Win".
        // If user touches the count input, it will reset to 1-N.
        setItemCount(newItems.length);
      } else {
        const newText = customItemsText
          .split('\n')
          .filter(line => line.trim() !== result)
          .join('\n');
        setCustomItemsText(newText);
        setItems(generateCustomItems(newText));
      }
    }
  };

  const handleCloseModal = () => {
    setWinner(null);
  };

  return (
    <>
      <h1>Roulette</h1>

      <RouletteWheel
        ref={wheelRef}
        items={items}
        onFinished={handleSpinFinished}
      />

      <Controls
        itemCount={itemCount}
        setItemCount={handleCountChange}
        removeOnWin={removeOnWin}
        setRemoveOnWin={setRemoveOnWin}
        isCustomMode={mode === 'CUSTOM'}
        setIsCustomMode={handleModeChange}
        customItemsText={customItemsText}
        setCustomItemsText={handleCustomTextChange}
        onSpin={handleSpin}
        disabled={isSpinning || items.length < 2}
      />

      <ResultModal
        result={winner}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default App;
