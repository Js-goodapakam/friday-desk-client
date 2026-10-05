const telecmiLogoFiles = import.meta.glob("../assets/telecmi logo.{png,svg,webp}", { eager:true, import:"default" });
export const TELECMI_LOGO = Object.values(telecmiLogoFiles)[0] || null;
const whatsappLogoFiles = import.meta.glob("../assets/whatsapp.{png,svg,webp}", { eager:true, import:"default" });
export const WHATSAPP_LOGO = Object.values(whatsappLogoFiles)[0] || null;
const rcsLogoFiles = import.meta.glob("../assets/{Rcs,rcs,RCS}.{png,svg,webp,PNG}", { eager:true, import:"default" });
export const RCS_LOGO = Object.values(rcsLogoFiles)[0] || null;
