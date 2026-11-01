import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createInstance} from 'i18next';
const namespaces=['common','navigation','settings','dashboard'];
const resources=Object.fromEntries(['en','kn'].map(lang=>[lang,Object.fromEntries(namespaces.map(ns=>[ns,JSON.parse(readFileSync(new URL(`../locales/${lang}/${ns}.json`,import.meta.url),'utf8'))]))]));
test('English and Kannada dictionaries have identical stable keys',()=>{for(const ns of namespaces)assert.deepEqual(Object.keys(resources.en[ns]).sort(),Object.keys(resources.kn[ns]).sort());});
test('language switch, fallback, interpolation and independent instances',async()=>{const a=createInstance(),b=createInstance();await a.init({resources,lng:'en',fallbackLng:'en',defaultNS:'common'});await b.init({resources,lng:'en',fallbackLng:'en',defaultNS:'common'});assert.equal(a.t('save'),'Save Changes');await a.changeLanguage('kn');assert.equal(a.t('save'),'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ');assert.equal(b.t('save'),'Save Changes');assert.match(a.t('records',{count:2}),/2/);a.addResource('en','common','fallbackTest','English fallback');assert.equal(a.t('fallbackTest'),'English fallback');await a.changeLanguage('en');assert.equal(a.t('save'),'Save Changes');});
