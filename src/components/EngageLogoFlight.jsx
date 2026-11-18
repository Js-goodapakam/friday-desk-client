import {useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

const ICON_SIZE = 96;
const FLIGHT_FALLBACK_MS = 1800;

/**
 * Animates the Engage icon from the centre of the loading screen to the actual
 * sidebar logo. Always reveals the real logo after the animation, including
 * when animationend does not fire (tab switching or interrupted animation).
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
    const movingIcon = layer?.querySelector('.engage-logo-flight-icon');
    if (!destination || !layer || !movingIcon) {
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
    let active = true;
    let completed = false;

    // Hide the permanent icon only while the moving copy is in flight.
    destination.style.opacity = '0';

    const complete = () => {
      if (!active || completed) return;
      completed = true;
      // Crucial: restoring opacity here, not only in effect cleanup, makes
      // the sidebar logo appear as soon as this animation ends.
      destination.style.opacity = previousOpacity;
      setFinished(true);
    };

    const onAnimationEnd = (event) => {
      if (event.target === movingIcon && event.animationName === 'engage-icon-fly-to-sidebar') {
        complete();
      }
    };

    movingIcon.addEventListener('animationend', onAnimationEnd);
    const frame = window.requestAnimationFrame(() => {
      if (active) layer.classList.add('engage-flight-running');
    });
    // Animationend is not guaranteed when styles, tabs or routes change.
    const fallback = window.setTimeout(complete, FLIGHT_FALLBACK_MS);

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
      movingIcon.removeEventListener('animationend', onAnimationEnd);
      destination.style.opacity = previousOpacity;
    };
  }, [targetSelector]);

  if (finished) return null;
  return createPortal(
    <div ref={layerRef} className="engage-logo-flight" aria-hidden="true">
      <div className="engage-logo-flight-curtain" />
      <img className="engage-logo-flight-icon" src="/engage-app-icon.svg" alt="" />
    </div>,
    document.body
  );
}
