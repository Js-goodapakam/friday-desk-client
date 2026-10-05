import { useEffect,useState } from "react";

export function useTeleCMISDKStatus(){
 const [status,setStatus]=useState(window.__teleCMISDKStatus||"disconnected");
 useEffect(()=>{
  const onStatus=e=>setStatus(e.detail||"disconnected");
  window.addEventListener("telecmi-status",onStatus);
  return()=>window.removeEventListener("telecmi-status",onStatus);
 },[]);
 return status;
}
