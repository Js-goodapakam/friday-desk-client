import {useEffect,useRef} from 'react';
export function useDialogFocus(active,onClose){
 const close=useRef(onClose);
 useEffect(()=>{close.current=onClose;},[onClose]);
 useEffect(()=>{if(!active)return;const previous=document.activeElement,dialog=document.querySelector('.pg-backdrop [role="dialog"]');if(!dialog)return;
  const controls=()=>[...dialog.querySelectorAll('input,select,textarea,button,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
  controls()[0]?.focus();
  const keys=e=>{if(e.key==='Escape'){e.preventDefault();close.current();}if(e.key==='Tab'){const items=controls(),first=items[0],last=items.at(-1);if(!first)return;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
  dialog.addEventListener('keydown',keys);return()=>{dialog.removeEventListener('keydown',keys);if(previous?.isConnected)previous.focus();};
 },[active]);
}
