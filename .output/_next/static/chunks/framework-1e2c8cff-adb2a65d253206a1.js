(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2570],{8018:function(e){var n,t,r,i,a,o,u,c,l,f,s,d,p,v,m,h,g,b,y,T,w,k,C,E,_,P,I,L,S,F,x,A,M,N,B,D,O,j,R,q,H,U,W,Y,z,G;(n={}).d=function(e,t){for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},void 0!==n&&(n.ab="//"),t={},n.r(t),n.d(t,{getCLS:function(){return C},getFCP:function(){return T},getFID:function(){return F},getINP:function(){return U},getLCP:function(){return Y},getTTFB:function(){return G},onCLS:function(){return C},onFCP:function(){return T},onFID:function(){return F},onINP:function(){return U},onLCP:function(){return Y},onTTFB:function(){return G}}),c=-1,l=function(e){addEventListener("pageshow",function(n){n.persisted&&(c=n.timeStamp,e(n))},!0)},f=function(){return window.performance&&performance.getEntriesByType&&performance.getEntriesByType("navigation")[0]},s=function(){var e=f();return e&&e.activationStart||0},d=function(e,n){var t=f(),r="navigate";return c>=0?r="back-forward-cache":t&&(r=document.prerendering||s()>0?"prerender":t.type.replace(/_/g,"-")),{name:e,value:void 0===n?-1:n,rating:"good",delta:0,entries:[],id:"v3-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12),navigationType:r}},p=function(e,n,t){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){var r=new PerformanceObserver(function(e){n(e.getEntries())});return r.observe(Object.assign({type:e,buffered:!0},t||{})),r}}catch(e){}},v=function(e,n){var t=function t(r){"pagehide"!==r.type&&"hidden"!==document.visibilityState||(e(r),n&&(removeEventListener("visibilitychange",t,!0),removeEventListener("pagehide",t,!0)))};addEventListener("visibilitychange",t,!0),addEventListener("pagehide",t,!0)},m=function(e,n,t,r){var i,a;return function(o){var u;n.value>=0&&(o||r)&&((a=n.value-(i||0))||void 0===i)&&(i=n.value,n.delta=a,n.rating=(u=n.value)>t[1]?"poor":u>t[0]?"needs-improvement":"good",e(n))}},h=-1,g=function(){return"hidden"!==document.visibilityState||document.prerendering?1/0:0},b=function(){v(function(e){h=e.timeStamp},!0)},y=function(){return h<0&&(h=g(),b(),l(function(){setTimeout(function(){h=g(),b()},0)})),{get firstHiddenTime(){return h}}},T=function(e,n){n=n||{};var t,r=[1800,3e3],i=y(),a=d("FCP"),o=function(e){e.forEach(function(e){"first-contentful-paint"===e.name&&(c&&c.disconnect(),e.startTime<i.firstHiddenTime&&(a.value=e.startTime-s(),a.entries.push(e),t(!0)))})},u=window.performance&&window.performance.getEntriesByName&&window.performance.getEntriesByName("first-contentful-paint")[0],c=u?null:p("paint",o);(u||c)&&(t=m(e,a,r,n.reportAllChanges),u&&o([u]),l(function(i){t=m(e,a=d("FCP"),r,n.reportAllChanges),requestAnimationFrame(function(){requestAnimationFrame(function(){a.value=performance.now()-i.timeStamp,t(!0)})})}))},w=!1,k=-1,C=function(e,n){n=n||{};var t=[.1,.25];w||(T(function(e){k=e.value}),w=!0);var r,i=function(n){k>-1&&e(n)},a=d("CLS",0),o=0,u=[],c=function(e){e.forEach(function(e){if(!e.hadRecentInput){var n=u[0],t=u[u.length-1];o&&e.startTime-t.startTime<1e3&&e.startTime-n.startTime<5e3?(o+=e.value,u.push(e)):(o=e.value,u=[e]),o>a.value&&(a.value=o,a.entries=u,r())}})},f=p("layout-shift",c);f&&(r=m(i,a,t,n.reportAllChanges),v(function(){c(f.takeRecords()),r(!0)}),l(function(){o=0,k=-1,r=m(i,a=d("CLS",0),t,n.reportAllChanges)}))},E={passive:!0,capture:!0},_=new Date,P=function(e,n){r||(r=n,i=e,a=new Date,S(removeEventListener),I())},I=function(){if(i>=0&&i<a-_){var e={entryType:"first-input",name:r.type,target:r.target,cancelable:r.cancelable,startTime:r.timeStamp,processingStart:r.timeStamp+i};o.forEach(function(n){n(e)}),o=[]}},L=function(e){if(e.cancelable){var n,t,r,i=(e.timeStamp>1e12?new Date:performance.now())-e.timeStamp;"pointerdown"==e.type?(n=function(){P(i,e),r()},t=function(){r()},r=function(){removeEventListener("pointerup",n,E),removeEventListener("pointercancel",t,E)},addEventListener("pointerup",n,E),addEventListener("pointercancel",t,E)):P(i,e)}},S=function(e){["mousedown","keydown","touchstart","pointerdown"].forEach(function(n){return e(n,L,E)})},F=function(e,n){n=n||{};var t,a=[100,300],u=y(),c=d("FID"),f=function(e){e.startTime<u.firstHiddenTime&&(c.value=e.processingStart-e.startTime,c.entries.push(e),t(!0))},s=function(e){e.forEach(f)},h=p("first-input",s);t=m(e,c,a,n.reportAllChanges),h&&v(function(){s(h.takeRecords()),h.disconnect()},!0),h&&l(function(){t=m(e,c=d("FID"),a,n.reportAllChanges),o=[],i=-1,r=null,S(addEventListener),o.push(f),I()})},x=0,A=1/0,M=0,N=function(e){e.forEach(function(e){e.interactionId&&(A=Math.min(A,e.interactionId),x=(M=Math.max(M,e.interactionId))?(M-A)/7+1:0)})},B=function(){return u?x:performance.interactionCount||0},D=function(){"interactionCount"in performance||u||(u=p("event",N,{type:"event",buffered:!0,durationThreshold:0}))},O=0,j=function(){return B()-O},R=[],q={},H=function(e){var n=R[R.length-1],t=q[e.interactionId];if(t||R.length<10||e.duration>n.latency){if(t)t.entries.push(e),t.latency=Math.max(t.latency,e.duration);else{var r={id:e.interactionId,latency:e.duration,entries:[e]};q[r.id]=r,R.push(r)}R.sort(function(e,n){return n.latency-e.latency}),R.splice(10).forEach(function(e){delete q[e.id]})}},U=function(e,n){n=n||{};var t=[200,500];D();var r,i=d("INP"),a=function(e){e.forEach(function(e){e.interactionId&&H(e),"first-input"!==e.entryType||R.some(function(n){return n.entries.some(function(n){return e.duration===n.duration&&e.startTime===n.startTime})})||H(e)});var n,t=(n=Math.min(R.length-1,Math.floor(j()/50)),R[n]);t&&t.latency!==i.value&&(i.value=t.latency,i.entries=t.entries,r())},o=p("event",a,{durationThreshold:n.durationThreshold||40});r=m(e,i,t,n.reportAllChanges),o&&(o.observe({type:"first-input",buffered:!0}),v(function(){a(o.takeRecords()),i.value<0&&j()>0&&(i.value=0,i.entries=[]),r(!0)}),l(function(){R=[],O=B(),r=m(e,i=d("INP"),t,n.reportAllChanges)}))},W={},Y=function(e,n){n=n||{};var t,r=[2500,4e3],i=y(),a=d("LCP"),o=function(e){var n=e[e.length-1];if(n){var r=n.startTime-s();r<i.firstHiddenTime&&(a.value=r,a.entries=[n],t())}},u=p("largest-contentful-paint",o);if(u){t=m(e,a,r,n.reportAllChanges);var c=function(){W[a.id]||(o(u.takeRecords()),u.disconnect(),W[a.id]=!0,t(!0))};["keydown","click"].forEach(function(e){addEventListener(e,c,{once:!0,capture:!0})}),v(c,!0),l(function(i){t=m(e,a=d("LCP"),r,n.reportAllChanges),requestAnimationFrame(function(){requestAnimationFrame(function(){a.value=performance.now()-i.timeStamp,W[a.id]=!0,t(!0)})})})}},z=function e(n){document.prerendering?addEventListener("prerenderingchange",function(){return e(n)},!0):"complete"!==document.readyState?addEventListener("load",function(){return e(n)},!0):setTimeout(n,0)},G=function(e,n){n=n||{};var t=[800,1800],r=d("TTFB"),i=m(e,r,t,n.reportAllChanges);z(function(){var a=f();if(a){if(r.value=Math.max(a.responseStart-s(),0),r.value<0||r.value>performance.now())return;r.entries=[a],i(!0),l(function(){(i=m(e,r=d("TTFB",0),t,n.reportAllChanges))(!0)})}})},e.exports=t},2010:function(e,n){"use strict";function t(e,n){var t=e.length;for(e.push(n);0<t;){var r=t-1>>>1,i=e[r];if(0<a(i,n))e[r]=n,e[t]=i,t=r;else break}}function r(e){return 0===e.length?null:e[0]}function i(e){if(0===e.length)return null;var n=e[0],t=e.pop();if(t!==n){e[0]=t;for(var r=0,i=e.length,o=i>>>1;r<o;){var u=2*(r+1)-1,c=e[u],l=u+1,f=e[l];if(0>a(c,t))l<i&&0>a(f,c)?(e[r]=f,e[l]=t,r=l):(e[r]=c,e[u]=t,r=u);else if(l<i&&0>a(f,t))e[r]=f,e[l]=t,r=l;else break}}return n}function a(e,n){var t=e.sortIndex-n.sortIndex;return 0!==t?t:e.id-n.id}if(n.unstable_now=void 0,"object"==typeof performance&&"function"==typeof performance.now){var o,u=performance;n.unstable_now=function(){return u.now()}}else{var c=Date,l=c.now();n.unstable_now=function(){return c.now()-l}}var f=[],s=[],d=1,p=null,v=3,m=!1,h=!1,g=!1,b="function"==typeof setTimeout?setTimeout:null,y="function"==typeof clearTimeout?clearTimeout:null,T="undefined"!=typeof setImmediate?setImmediate:null;function w(e){for(var n=r(s);null!==n;){if(null===n.callback)i(s);else if(n.startTime<=e)i(s),n.sortIndex=n.expirationTime,t(f,n);else break;n=r(s)}}function k(e){if(g=!1,w(e),!h){if(null!==r(f))h=!0,x();else{var n=r(s);null!==n&&A(k,n.startTime-e)}}}"undefined"!=typeof navigator&&void 0!==navigator.scheduling&&void 0!==navigator.scheduling.isInputPending&&navigator.scheduling.isInputPending.bind(navigator.scheduling);var C=!1,E=-1,_=5,P=-1;function I(){return!(n.unstable_now()-P<_)}function L(){if(C){var e=n.unstable_now();P=e;var t=!0;try{e:{h=!1,g&&(g=!1,y(E),E=-1),m=!0;var a=v;try{n:{for(w(e),p=r(f);null!==p&&!(p.expirationTime>e&&I());){var u=p.callback;if("function"==typeof u){p.callback=null,v=p.priorityLevel;var c=u(p.expirationTime<=e);if(e=n.unstable_now(),"function"==typeof c){p.callback=c,w(e),t=!0;break n}p===r(f)&&i(f),w(e)}else i(f);p=r(f)}if(null!==p)t=!0;else{var l=r(s);null!==l&&A(k,l.startTime-e),t=!1}}break e}finally{p=null,v=a,m=!1}t=void 0}}finally{t?o():C=!1}}}if("function"==typeof T)o=function(){T(L)};else if("undefined"!=typeof MessageChannel){var S=new MessageChannel,F=S.port2;S.port1.onmessage=L,o=function(){F.postMessage(null)}}else o=function(){b(L,0)};function x(){C||(C=!0,o())}function A(e,t){E=b(function(){e(n.unstable_now())},t)}n.unstable_IdlePriority=5,n.unstable_ImmediatePriority=1,n.unstable_LowPriority=4,n.unstable_NormalPriority=3,n.unstable_Profiling=null,n.unstable_UserBlockingPriority=2,n.unstable_cancelCallback=function(e){e.callback=null},n.unstable_continueExecution=function(){h||m||(h=!0,x())},n.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):_=0<e?Math.floor(1e3/e):5},n.unstable_getCurrentPriorityLevel=function(){return v},n.unstable_getFirstCallbackNode=function(){return r(f)},n.unstable_next=function(e){switch(v){case 1:case 2:case 3:var n=3;break;default:n=v}var t=v;v=n;try{return e()}finally{v=t}},n.unstable_pauseExecution=function(){},n.unstable_requestPaint=function(){},n.unstable_runWithPriority=function(e,n){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var t=v;v=e;try{return n()}finally{v=t}},n.unstable_scheduleCallback=function(e,i,a){var o=n.unstable_now();switch(a="object"==typeof a&&null!==a&&"number"==typeof(a=a.delay)&&0<a?o+a:o,e){case 1:var u=-1;break;case 2:u=250;break;case 5:u=1073741823;break;case 4:u=1e4;break;default:u=5e3}return u=a+u,e={id:d++,callback:i,priorityLevel:e,startTime:a,expirationTime:u,sortIndex:-1},a>o?(e.sortIndex=a,t(s,e),null===r(f)&&e===r(s)&&(g?(y(E),E=-1):g=!0,A(k,a-o))):(e.sortIndex=u,t(f,e),h||m||(h=!0,x())),e},n.unstable_shouldYield=I,n.unstable_wrapCallback=function(e){var n=v;return function(){var t=v;v=n;try{return e.apply(this,arguments)}finally{v=t}}}},1767:function(e,n,t){"use strict";e.exports=t(2010)}}]);