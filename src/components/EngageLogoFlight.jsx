import {useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

const ICON_SIZE = 96;

/**
 * Keeps the centered loader logo visible as the workspace becomes ready, then
 * flies a matching icon to the real rendered sidebar logo coordinates.
 * The destination logo is temporarily hidden until the flight finishes.
 */
export default function EngageLogoFlight({targetSelector}) {
  const [finished, setFinished] = useState(false);
  const layerRef = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFinished(true);
      return;
    }
    const destination = document.querySelector(targetSelector);
    const layer = layerRef.current;
    if (!destination || !layer) {
      setFinished(true);
      return;
    }

    const rect = destination.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      setFinished(true);
      return;
    }
    const destinationX = rect.left + rect.width / 2;
    const destinationY = rect.top + rect.height / 2;
    const offsetX = destinationX - window.innerWidth / 2;
    const offsetY = destinationY - window.innerHeight / 2;
    const scale = Math.min(rect.width, rect.height) / ICON_SIZE;

    layer.style.setProperty('--engage-flight-x', `${offsetX}px`);
    layer.style.setProperty('--engage-flight-y', `${offsetY}px`);
    layer.style.setProperty('--engage-flight-scale', String(scale));
    layer.style.setProperty('--engage-flight-destination-x', `${destinationX}px`);
    layer.style.setProperty('--engage-flight-destination-y', `${destinationY}px`);

    const previousOpacity = destination.style.opacity;
    destination.style.opacity = '0';
    const frame = window.requestAnimationFrame(() => {
      layer.classList.add('engage-flight-running');
    });
    return () => {
      window.cancelAnimationFrame(frame);
      destination.style.opacity = previousOpacity;
    };
  }, [targetSelector]);

  if (finished) return null;
  return createPortal(
    <div ref={layerRef} className="engage-logo-flight" aria-hidden="true">
      <div className="engage-logo-flight-curtain" />
      <img className="engage-logo-flight-icon" src="/engage-app-icon.svg" alt=""
        onAnimationEnd={(event) => {
          if (event.animationName === 'engage-icon-fly-to-sidebar') setFinished(true);
        }}
      />
    </div>,
    document.body
  );
}
