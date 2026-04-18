import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';

export default function Splash({ onFinish }) {
  const [stage, setStage] = useState('logo'); // 'logo' -> 'welcome' -> 'exit'

  useEffect(() => {
    // Stage 1: Show logo for 1.5s
    const timer1 = setTimeout(() => {
      setStage('welcome');
    }, 1500);

    // Stage 2: Show welcome for 1s, then exit
    const timer2 = setTimeout(() => {
      setStage('exit');
      setTimeout(onFinish, 500); // Wait for fade out animation
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container ${stage === 'exit' ? 'fade-out' : ''}`}>
      <div className="splash-content">
        {stage === 'logo' ? (
          <div className="splash-logo-container animate-pop">
            <CalendarClock size={64} color="#10B981" className="splash-icon" />
            <h1 className="logo splash-logo" style={{ fontSize: '48px' }}>
              Slot<span>ify</span>
            </h1>
          </div>
        ) : (
          <div className="splash-welcome-container animate-fade-in">
            <h1 style={{ fontSize: '36px', fontWeight: '500' }}>Welcome</h1>
          </div>
        )}
      </div>
    </div>
  );
}
