import React, { useRef, useState, useEffect } from 'react';

function TimerSet(props) {
    console.log('Rendering TimerSet with pi_id:', props.pi_id);
  
    const [PiExpire, SetPiexpire] = useState('');
    const timerRefs = useRef({}); // Store timeouts
  
    useEffect(() => {
      console.log('useEffect triggered with pi_id:', props.pi_id);
  
      if (timerRefs.current[props.pi_id]) {
        clearTimeout(timerRefs.current[props.pi_id]);
        console.log('Cleared timeout for props.pi_id:', props.pi_id);
      }
  
      timerRefs.current[props.pi_id] = setTimeout(() => {
        delete timerRefs.current[props.pi_id];
        SetPiexpire(props.pi_id);
        console.log('Deleted props.pi_id after 15 seconds:', props.pi_id);
      }, 15000);
  
      return () => {
        if (timerRefs.current[props.pi_id]) {
          clearTimeout(timerRefs.current[props.pi_id]);
          delete timerRefs.current[props.pi_id];
        }
      };
    }, [props.pi_id]);
  
    return <>{PiExpire ? `Expired: ${PiExpire}` : 'Timer Running...'}</>;
  }
  

export default TimerSet;