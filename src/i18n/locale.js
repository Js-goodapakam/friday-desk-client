let language='en';
export const setLocale=code=>{language=code==='kn'?'kn':'en';};
export const locale=()=>language==='kn'?'kn-IN':'en-IN';
