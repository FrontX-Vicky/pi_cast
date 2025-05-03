import React, { useLayoutEffect, useRef } from 'react';

const ScrollToBottomDiv = ({ items, height = 200 }) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  // Scroll into view right after DOM mutations, before the browser paints.
  useLayoutEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [items]);  // also re‑run if `items` ever change

  return (
    <div
      ref={containerRef}
      style={{
        height: `${height}px`,
        overflowY: 'auto',
    
        padding: '8px',
        boxSizing: 'border-box',
      }}
    >
      {items.map((text, idx) => (
        <p key={idx} className='text-white' style={{ margin: '8px 0' }}>
          {text}
        </p>
      ))}

      {/* This empty div is our scroll “anchor” */}
      <div ref={bottomRef} />
    </div>
  );
};

export default ScrollToBottomDiv;
