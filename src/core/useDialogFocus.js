import {useEffect,useRef} from 'react';
export function useDialogFocus(active,onClose){
 const close=useRef(onClose);
 useEffect(()=>{close.current=onClose;},[onClose]);
 useEffect(()=>{if(!active)return;const previous=document.activeElement,dialog=document.querySelector('.pg-backdrop [role="dialog"]');if(!dialog)return;
  const controls=()=>[...dialog.querySelectorAll('input,select,textarea,button,a[href],[tabindex],[contenteditable=true]')].filter(el=>!el.matches(':disabled')&&el.tabIndex>=0&&!el.closest('[inert],[aria-hidden=true]')&&el.getClientRects().length&&getComputedStyle(el).visibility==='visible');
  const temporaryTabIndex=!dialog.hasAttribute('tabindex');
  if(temporaryTabIndex)dialog.setAttribute('tabindex','-1');
  (controls()[0]||dialog).focus();
  const keys=e=>{if(e.key==='Escape'){e.preventDefault();close.current();}if(e.key==='Tab'){const items=controls(),first=items[0],last=items.at(-1);if(!first){e.preventDefault();dialog.focus();return;}if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
  dialog.addEventListener('keydown',keys);return()=>{dialog.removeEventListener('keydown',keys);if(temporaryTabIndex)dialog.removeAttribute('tabindex');if(previous?.isConnected)previous.focus();};
 },[active]);
}
