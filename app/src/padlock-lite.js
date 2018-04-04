(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.padlock = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AjaxError {
    constructor(code, request) {
        this.code = code;
        this.request = request;
    }
    ;
}
exports.AjaxError = AjaxError;
function errorFromRequest(req) {
    switch (req.status.toString()[0]) {
        case "0":
            return new AjaxError("failed_connection", req);
        case "3":
            return new AjaxError("unexpected_redirect", req);
        case "4":
            return new AjaxError("client_error", req);
        case "5":
            return new AjaxError("server_error", req);
        default:
            return null;
    }
}
function request(method, url, body, headers) {
    let req = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
        req.onreadystatechange = () => {
            if (req.readyState === 4) {
                const err = errorFromRequest(req);
                if (err) {
                    reject(err);
                }
                else {
                    resolve(req);
                }
            }
        };
        try {
            req.open(method, url, true);
            if (headers) {
                headers.forEach((value, key) => req.setRequestHeader(key, value));
            }
            req.send(body);
        }
        catch (e) {
            reject(new AjaxError("failed_connection", req));
        }
    });
}
exports.request = request;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("./util");
exports.util = util;
const platform = require("./platform");
exports.platform = platform;
const ajax = require("./ajax");
exports.ajax = ajax;

},{"./ajax":1,"./platform":3,"./util":4}],3:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodeRequire = window.require;
const electron = nodeRequire && nodeRequire("electron");
const cordovaReady = new Promise((r) => document.addEventListener("deviceready", () => r()));
// Textarea used for copying/pasting using the dom
let clipboardTextArea;
// Set clipboard text using `document.execCommand("cut")`.
// NOTE: This only works in certain environments like Google Chrome apps with the appropriate permissions set
function domSetClipboard(text) {
    clipboardTextArea = clipboardTextArea || document.createElement("textarea");
    clipboardTextArea.value = text;
    document.body.appendChild(clipboardTextArea);
    clipboardTextArea.select();
    document.execCommand("cut");
    document.body.removeChild(clipboardTextArea);
}
// Get clipboard text using `document.execCommand("paste")`
// NOTE: This only works in certain environments like Google Chrome apps with the appropriate permissions set
function domGetClipboard() {
    clipboardTextArea = clipboardTextArea || document.createElement("textarea");
    document.body.appendChild(clipboardTextArea);
    clipboardTextArea.value = "";
    clipboardTextArea.select();
    document.execCommand("paste");
    document.body.removeChild(clipboardTextArea);
    return clipboardTextArea.value;
}
function isCordova() {
    return typeof cordova !== "undefined";
}
exports.isCordova = isCordova;
//* Checks if the app is running as a packaged Chrome app
function isChromeApp() {
    return (typeof chrome !== "undefined") && chrome.app && !!chrome.app.runtime;
}
exports.isChromeApp = isChromeApp;
function isIOS() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getPlatformName()).toLowerCase() === "ios";
    });
}
exports.isIOS = isIOS;
function isAndroid() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getPlatformName()).toLowerCase() === "android";
    });
}
exports.isAndroid = isAndroid;
function isChromeOS() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getPlatformName()).toLowerCase() === "chromeos";
    });
}
exports.isChromeOS = isChromeOS;
//* Checks if the current environment supports touch events
function isTouch() {
    try {
        document.createEvent("TouchEvent");
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isTouch = isTouch;
//* Sets the clipboard text to a given string
function setClipboard(text) {
    return __awaiter(this, void 0, void 0, function* () {
        // If cordova clipboard plugin is available, use that one. Otherwise use the execCommand implemenation
        if (isCordova()) {
            yield cordovaReady;
            return new Promise((resolve, reject) => {
                cordova.plugins.clipboard.copy(text, resolve, reject);
            });
        }
        else if (isElectron()) {
            electron.clipboard.writeText(text);
        }
        else {
            domSetClipboard(text);
        }
    });
}
exports.setClipboard = setClipboard;
//* Retrieves the clipboard text
function getClipboard() {
    return __awaiter(this, void 0, void 0, function* () {
        // If cordova clipboard plugin is available, use that one. Otherwise use the execCommand implemenation
        if (isCordova()) {
            yield cordovaReady;
            return new Promise((resolve, reject) => {
                cordova.plugins.clipboard.paste(resolve, reject);
            });
        }
        else if (isElectron()) {
            return electron.clipboard.readText();
        }
        else {
            return domGetClipboard();
        }
    });
}
exports.getClipboard = getClipboard;
function getAppStoreLink() {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield isIOS()) {
            return "https://itunes.apple.com/app/id871710139";
        }
        else if (yield isAndroid()) {
            return "https://play.google.com/store/apps/details?id=com.maklesoft.padlock";
        }
        else if (yield isChromeApp()) {
            return "https://chrome.google.com/webstore/detail/padlock/npkoefjfcjbknoeadfkbcdpbapaamcif";
        }
        else {
            return "https://padlock.io";
        }
    });
}
exports.getAppStoreLink = getAppStoreLink;
function getReviewLink(rating) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield isIOS()) {
            return "https://itunes.apple.com/app/id871710139?action=write-review";
        }
        else if (yield isAndroid()) {
            return "https://play.google.com/store/apps/details?id=com.maklesoft.padlock";
        }
        else if (yield isChromeApp()) {
            return "https://chrome.google.com/webstore/detail/padlock/npkoefjfcjbknoeadfkbcdpbapaamcif/reviews";
        }
        else {
            const version = yield getAppVersion();
            const platform = yield getPlatformName();
            return `https://padlock.io/feedback/?r=${rating}&p=${encodeURIComponent(platform)}&v=${version}`;
        }
    });
}
exports.getReviewLink = getReviewLink;
function hasNode() {
    return !!nodeRequire;
}
exports.hasNode = hasNode;
function isElectron() {
    return !!electron;
}
exports.isElectron = isElectron;
function getAppVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isElectron()) {
            return electron.remote.app.getVersion();
        }
        else if (isCordova()) {
            yield cordovaReady;
            return new Promise((resolve, reject) => {
                cordova.getAppVersion.getVersionNumber(resolve, reject);
            });
        }
        else if (isChromeApp()) {
            return chrome.runtime.getManifest().version;
        }
        return "";
    });
}
exports.getAppVersion = getAppVersion;
function getPlatformName() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isElectron()) {
            const platform = nodeRequire("os").platform();
            return {
                darwin: "MacOS",
                win32: "Windows",
                linux: "Linux"
            }[platform] || platform;
        }
        else if (isCordova()) {
            yield cordovaReady;
            return device.platform;
        }
        else if (isChromeApp()) {
            const info = yield new Promise((r) => chrome.runtime.getPlatformInfo(r));
            return {
                cros: "ChromeOS",
                win: "Windows (Chrome)",
                linux: "Linux (Chrome)",
                android: "Android (Chrome)",
                mac: "MacOS (Chrome)",
                openbsd: "OpenBSD (Chrome)"
            }[info.os] || info.os;
        }
        else {
            return "";
        }
    });
}
exports.getPlatformName = getPlatformName;
function getDesktopSettings() {
    return isElectron() ? electron.remote.getGlobal("settings") : null;
}
exports.getDesktopSettings = getDesktopSettings;
function getDeviceUUID() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isCordova()) {
            yield cordovaReady;
            return device.uuid;
        }
        else if (isElectron()) {
            return getDesktopSettings().get("uuid");
        }
        else {
            return "";
        }
    });
}
exports.getDeviceUUID = getDeviceUUID;
function getOSVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isCordova()) {
            yield cordovaReady;
            return device.version;
        }
        else if (hasNode()) {
            return nodeRequire("os").release();
        }
        else {
            return "";
        }
    });
}
exports.getOSVersion = getOSVersion;
function checkForUpdates() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isElectron()) {
            electron.ipcRenderer.send("check-updates");
        }
        else {
            window.open(yield getAppStoreLink(), "_system");
        }
    });
}
exports.checkForUpdates = checkForUpdates;
function saveDBAs() {
    if (isElectron()) {
        electron.ipcRenderer.send("save-db-as");
    }
}
exports.saveDBAs = saveDBAs;
function loadDB() {
    if (isElectron()) {
        electron.ipcRenderer.send("load-db");
    }
}
exports.loadDB = loadDB;
function getLocale() {
    // TODO: Is there a more reliable way to get the system locale,
    // e.g. through `electron.remote.app.getLocale()`?
    return navigator.language || "en";
}
exports.getLocale = getLocale;
function getDeviceInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        const info = {
            platform: yield getPlatformName(),
            osVersion: yield getOSVersion(),
            appVersion: yield getAppVersion(),
            uuid: yield getDeviceUUID()
        };
        if (isCordova()) {
            yield cordovaReady;
            info.model = device.model;
            info.manufacturer = device.manufacturer;
        }
        if (isElectron()) {
            info.hostName = nodeRequire("os").hostname();
        }
        return info;
    });
}
exports.getDeviceInfo = getDeviceInfo;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// RFC4122-compliant uuid generator
function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
exports.uuid = uuid;
exports.chars = {
    numbers: "0123456789",
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    other: "/+()%\"=&-!:'*#?;,_.@`~$^[{]}\\|<>"
};
exports.charSets = {
    full: exports.chars.numbers + exports.chars.upper + exports.chars.lower + exports.chars.other,
    alphanum: exports.chars.numbers + exports.chars.upper + exports.chars.lower,
    alpha: exports.chars.lower + exports.chars.upper,
    num: exports.chars.numbers,
    hexa: exports.chars.numbers + "abcdef"
};
//* Creates a random string with a given _length_ comprised of given set or characters
function randomString(length = 32, charSet = exports.charSets.full) {
    let rnd = new Uint8Array(1);
    let str = "";
    while (str.length < length) {
        window.crypto.getRandomValues(rnd);
        // Prevent modulo bias by rejecting values larger than the highest muliple of `charSet.length`
        if (rnd[0] > 255 - 256 % charSet.length) {
            continue;
        }
        str += charSet[rnd[0] % charSet.length];
    }
    return str;
}
exports.randomString = randomString;
function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => fn(args), delay);
    };
}
exports.debounce = debounce;
function wait(dt) {
    return new Promise((resolve) => setTimeout(resolve, dt));
}
exports.wait = wait;
function resolveLanguage(locale, supportedLanguages) {
    const localeParts = locale.toLowerCase().split("-");
    while (localeParts.length) {
        const l = localeParts.join("-");
        if (supportedLanguages[l]) {
            return l;
        }
        localeParts.pop();
    }
    return Object.keys(supportedLanguages)[0];
}
exports.resolveLanguage = resolveLanguage;
function applyMixins(baseClass, ...mixins) {
    return mixins.reduce((cls, mixin) => mixin(cls), baseClass);
}
exports.applyMixins = applyMixins;

},{}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc3JjL2NvcmUvYWpheC50cyIsImFwcC9zcmMvY29yZS9tYWluLWxpdGUudHMiLCJhcHAvc3JjL2NvcmUvcGxhdGZvcm0udHMiLCJhcHAvc3JjL2NvcmUvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7SUFDSSxZQUNXLElBSVcsRUFDWCxPQUF1QjtRQUx2QixTQUFJLEdBQUosSUFBSSxDQUlPO1FBQ1gsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7SUFDL0IsQ0FBQztJQUFBLENBQUM7Q0FDUjtBQVRELDhCQVNDO0FBSUQsMEJBQTBCLEdBQW1CO0lBQ3pDLFFBQVEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNsQyxLQUFLLEdBQUc7WUFDSixPQUFPLElBQUksU0FBUyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELEtBQUssR0FBRztZQUNKLE9BQU8sSUFBSSxTQUFTLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckQsS0FBSyxHQUFHO1lBQ0osT0FBTyxJQUFJLFNBQVMsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDOUMsS0FBSyxHQUFHO1lBQ0osT0FBTyxJQUFJLFNBQVMsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDOUM7WUFDSSxPQUFPLElBQUksQ0FBQTtLQUNkO0FBQ0wsQ0FBQztBQUVELGlCQUF3QixNQUFjLEVBQUUsR0FBVyxFQUFFLElBQWEsRUFBRSxPQUE2QjtJQUM3RixJQUFJLEdBQUcsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0lBRS9CLE9BQU8sSUFBSSxPQUFPLENBQWlCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25ELEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLEVBQUU7WUFDMUIsSUFBSSxH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RyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXBELE9BQU8sV0FBVyxDQUFDLE1BQU0sRUFBRTtRQUN2QixNQUFNLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxDQUFDLENBQUM7U0FDWjtRQUVELFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNyQjtJQUVELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFiRCwwQ0FhQztBQUVELHFCQUE0QixTQUFjLEVBQUUsR0FBRyxNQUE2QjtJQUN4RSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUZELGtDQUVDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IGNsYXNzIEFqYXhFcnJvciB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyBjb2RlOlxuICAgICAgICAgICAgXCJmYWlsZWRfY29ubmVjdGlvblwiIHxcbiAgICAgICAgICAgIFwidW5leHBlY3RlZF9yZWRpcmVjdFwiIHxcbiAgICAgICAgICAgIFwiY2xpZW50X2Vycm9yXCIgfFxuICAgICAgICAgICAgXCJzZXJ2ZXJfZXJyb3JcIixcbiAgICAgICAgcHVibGljIHJlcXVlc3Q6IFhNTEh0dHBSZXF1ZXN0XG4gICAgKSB7fTtcbn1cblxuZXhwb3J0IHR5cGUgTWV0aG9kID0gXCJHRVRcIiB8IFwiUE9TVFwiIHwgXCJQVVRcIiB8IFwiREVMRVRFXCI7XG5cbmZ1bmN0aW9uIGVycm9yRnJvbVJlcXVlc3QocmVxOiBYTUxIdHRwUmVxdWVzdCk6IEFqYXhFcnJvciB8IG51bGwge1xuICAgIHN3aXRjaCAocmVxLnN0YXR1cy50b1N0cmluZygpWzBdKSB7XG4gICAgY2FzZSBcIjBcIjpcbiAgICAgICAgcmV0dXJuIG5ldyBBamF4RXJyb3IoXCJmYWlsZWRfY29ubmVjdGlvblwiLCByZXEpO1xuICAgIGNhc2UgXCIzXCI6XG4gICAgICAgIHJldHVybiBuZXcgQWpheEVycm9yKFwidW5leHBlY3RlZF9yZWRpcmVjdFwiLCByZXEpO1xuICAgIGNhc2UgXCI0XCI6XG4gICAgICAgIHJldHVybiBuZXcgQWpheEVycm9yKFwiY2xpZW50X2Vycm9yXCIsIHJlcSk7XG4gICAgY2FzZSBcIjVcIjpcbiAgICAgICAgcmV0dXJuIG5ldyBBamF4RXJyb3IoXCJzZXJ2ZXJfZXJyb3JcIiwgcmVxKTtcbiAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kOiBNZXRob2QsIHVybDogc3RyaW5nLCBib2R5Pzogc3RyaW5nLCBoZWFkZXJzPzogTWFwPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8WE1MSHR0cFJlcXVlc3Q+IHtcbiAgICBsZXQgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2U8WE1MSHR0cFJlcXVlc3Q+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVyciA9IGVycm9yRnJvbVJlcXVlc3QocmVxKTtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVxLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHJlcS5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcS5zZW5kKGJvZHkpO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgQWpheEVycm9yKFwiZmFpbGVkX2Nvbm5lY3Rpb25cIiwgcmVxKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiIsImltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4vdXRpbFwiO1xuaW1wb3J0ICogYXMgcGxhdGZvcm0gZnJvbSBcIi4vcGxhdGZvcm1cIjtcbmltcG9ydCAqIGFzIGFqYXggZnJvbSBcIi4vYWpheFwiO1xuXG5leHBvcnQge1xuICAgIHV0aWwsXG4gICAgYWpheCxcbiAgICBwbGF0Zm9ybVxufVxuIiwiZGVjbGFyZSB2YXIgY29yZG92YTogYW55IHwgdW5kZWZpbmVkO1xuZGVjbGFyZSB2YXIgY2hyb21lOiBhbnkgfCB1bmRlZmluZWQ7XG5kZWNsYXJlIHZhciBkZXZpY2U6IGFueSB8IHVuZGVmaW5lZDtcblxuY29uc3Qgbm9kZVJlcXVpcmUgPSB3aW5kb3cucmVxdWlyZTtcbmNvbnN0IGVsZWN0cm9uID0gbm9kZVJlcXVpcmUgJiYgbm9kZVJlcXVpcmUoXCJlbGVjdHJvblwiKTtcbmNvbnN0IGNvcmRvdmFSZWFkeSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyKSA9PiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGV2aWNlcmVhZHlcIiwgKCkgPT4gcigpKSk7XG5cbi8vIFRleHRhcmVhIHVzZWQgZm9yIGNvcHlpbmcvcGFzdGluZyB1c2luZyB0aGUgZG9tXG5sZXQgY2xpcGJvYXJkVGV4dEFyZWE6IEhUTUxUZXh0QXJlYUVsZW1lbnQ7XG5cbi8vIFNldCBjbGlwYm9hcmQgdGV4dCB1c2luZyBgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjdXRcIilgLlxuLy8gTk9URTogVGhpcyBvbmx5IHdvcmtzIGluIGNlcnRhaW4gZW52aXJvbm1lbnRzIGxpa2UgR29vZ2xlIENocm9tZSBhcHBzIHdpdGggdGhlIGFwcHJvcHJpYXRlIHBlcm1pc3Npb25zIHNldFxuZnVuY3Rpb24gZG9tU2V0Q2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgIGNsaXBib2FyZFRleHRBcmVhID0gY2xpcGJvYXJkVGV4dEFyZWEgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRleHRhcmVhXCIpO1xuICAgIGNsaXBib2FyZFRleHRBcmVhLnZhbHVlID0gdGV4dDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNsaXBib2FyZFRleHRBcmVhKTtcbiAgICBjbGlwYm9hcmRUZXh0QXJlYS5zZWxlY3QoKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImN1dFwiKTtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGNsaXBib2FyZFRleHRBcmVhKTtcbn1cblxuLy8gR2V0IGNsaXBib2FyZCB0ZXh0IHVzaW5nIGBkb2N1bWVudC5leGVjQ29tbWFuZChcInBhc3RlXCIpYFxuLy8gTk9URTogVGhpcyBvbmx5IHdvcmtzIGluIGNlcnRhaW4gZW52aXJvbm1lbnRzIGxpa2UgR29vZ2xlIENocm9tZSBhcHBzIHdpdGggdGhlIGFwcHJvcHJpYXRlIHBlcm1pc3Npb25zIHNldFxuZnVuY3Rpb24gZG9tR2V0Q2xpcGJvYXJkKCk6IHN0cmluZyB7XG4gICAgY2xpcGJvYXJkVGV4dEFyZWEgPSBjbGlwYm9hcmRUZXh0QXJlYSB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGV4dGFyZWFcIik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjbGlwYm9hcmRUZXh0QXJlYSk7XG4gICAgY2xpcGJvYXJkVGV4dEFyZWEudmFsdWUgPSBcIlwiO1xuICAgIGNsaXBib2FyZFRleHRBcmVhLnNlbGVjdCgpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwicGFzdGVcIik7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChjbGlwYm9hcmRUZXh0QXJlYSk7XG4gICAgcmV0dXJuIGNsaXBib2FyZFRleHRBcmVhLnZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb3Jkb3ZhKCk6IEJvb2xlYW4ge1xuICAgIHJldHVybiB0eXBlb2YgY29yZG92YSAhPT0gXCJ1bmRlZmluZWRcIjtcbn1cblxuLy8qIENoZWNrcyBpZiB0aGUgYXBwIGlzIHJ1bm5pbmcgYXMgYSBwYWNrYWdlZCBDaHJvbWUgYXBwXG5leHBvcnQgZnVuY3Rpb24gaXNDaHJvbWVBcHAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0eXBlb2YgY2hyb21lICE9PSBcInVuZGVmaW5lZFwiKSAmJiBjaHJvbWUuYXBwICYmICEhY2hyb21lLmFwcC5ydW50aW1lO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNJT1MoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCBnZXRQbGF0Zm9ybU5hbWUoKSkudG9Mb3dlckNhc2UoKSA9PT0gXCJpb3NcIjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzQW5kcm9pZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IGdldFBsYXRmb3JtTmFtZSgpKS50b0xvd2VyQ2FzZSgpID09PSBcImFuZHJvaWRcIjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzQ2hyb21lT1MoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCBnZXRQbGF0Zm9ybU5hbWUoKSkudG9Mb3dlckNhc2UoKSA9PT0gXCJjaHJvbWVvc1wiO1xufVxuXG4vLyogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IHN1cHBvcnRzIHRvdWNoIGV2ZW50c1xuZXhwb3J0IGZ1bmN0aW9uIGlzVG91Y2goKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJUb3VjaEV2ZW50XCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8vKiBTZXRzIHRoZSBjbGlwYm9hcmQgdGV4dCB0byBhIGdpdmVuIHN0cmluZ1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldENsaXBib2FyZCh0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBJZiBjb3Jkb3ZhIGNsaXBib2FyZCBwbHVnaW4gaXMgYXZhaWxhYmxlLCB1c2UgdGhhdCBvbmUuIE90aGVyd2lzZSB1c2UgdGhlIGV4ZWNDb21tYW5kIGltcGxlbWVuYXRpb25cbiAgICBpZiAoaXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgYXdhaXQgY29yZG92YVJlYWR5O1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29yZG92YS5wbHVnaW5zLmNsaXBib2FyZC5jb3B5KHRleHQsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoaXNFbGVjdHJvbigpKSB7XG4gICAgICAgIGVsZWN0cm9uLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9tU2V0Q2xpcGJvYXJkKHRleHQpO1xuICAgIH1cbn1cblxuLy8qIFJldHJpZXZlcyB0aGUgY2xpcGJvYXJkIHRleHRcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDbGlwYm9hcmQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAvLyBJZiBjb3Jkb3ZhIGNsaXBib2FyZCBwbHVnaW4gaXMgYXZhaWxhYmxlLCB1c2UgdGhhdCBvbmUuIE90aGVyd2lzZSB1c2UgdGhlIGV4ZWNDb21tYW5kIGltcGxlbWVuYXRpb25cbiAgICBpZiAoaXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgYXdhaXQgY29yZG92YVJlYWR5O1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb3Jkb3ZhLnBsdWdpbnMuY2xpcGJvYXJkLnBhc3RlKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoaXNFbGVjdHJvbigpKSB7XG4gICAgICAgIHJldHVybiBlbGVjdHJvbi5jbGlwYm9hcmQucmVhZFRleHQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZG9tR2V0Q2xpcGJvYXJkKCk7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBwU3RvcmVMaW5rKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKGF3YWl0IGlzSU9TKCkpIHtcbiAgICAgICAgcmV0dXJuIFwiaHR0cHM6Ly9pdHVuZXMuYXBwbGUuY29tL2FwcC9pZDg3MTcxMDEzOVwiO1xuICAgIH0gZWxzZSBpZiAoYXdhaXQgaXNBbmRyb2lkKCkpIHtcbiAgICAgICAgcmV0dXJuIFwiaHR0cHM6Ly9wbGF5Lmdvb2dsZS5jb20vc3RvcmUvYXBwcy9kZXRhaWxzP2lkPWNvbS5tYWtsZXNvZnQucGFkbG9ja1wiO1xuICAgIH0gZWxzZSBpZiAoYXdhaXQgaXNDaHJvbWVBcHAoKSkge1xuICAgICAgICByZXR1cm4gXCJodHRwczovL2Nocm9tZS5nb29nbGUuY29tL3dlYnN0b3JlL2RldGFpbC9wYWRsb2NrL25wa29lZmpmY2pia25vZWFkZmtiY2RwYmFwYWFtY2lmXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiaHR0cHM6Ly9wYWRsb2NrLmlvXCI7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UmV2aWV3TGluayhyYXRpbmc6bnVtYmVyKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBpZiAoYXdhaXQgaXNJT1MoKSkge1xuICAgICAgICByZXR1cm4gXCJodHRwczovL2l0dW5lcy5hcHBsZS5jb20vYXBwL2lkODcxNzEwMTM5P2FjdGlvbj13cml0ZS1yZXZpZXdcIjtcbiAgICB9IGVsc2UgaWYgKGF3YWl0IGlzQW5kcm9pZCgpKSB7XG4gICAgICAgIHJldHVybiBcImh0dHBzOi8vcGxheS5nb29nbGUuY29tL3N0b3JlL2FwcHMvZGV0YWlscz9pZD1jb20ubWFrbGVzb2Z0LnBhZGxvY2tcIjtcbiAgICB9IGVsc2UgaWYgKGF3YWl0IGlzQ2hyb21lQXBwKCkpIHtcbiAgICAgICAgcmV0dXJuIFwiaHR0cHM6Ly9jaHJvbWUuZ29vZ2xlLmNvbS93ZWJzdG9yZS9kZXRhaWwvcGFkbG9jay9ucGtvZWZqZmNqYmtub2VhZGZrYmNkcGJhcGFhbWNpZi9yZXZpZXdzXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IGF3YWl0IGdldEFwcFZlcnNpb24oKTtcbiAgICAgICAgY29uc3QgcGxhdGZvcm0gPSBhd2FpdCBnZXRQbGF0Zm9ybU5hbWUoKTtcbiAgICAgICAgcmV0dXJuIGBodHRwczovL3BhZGxvY2suaW8vZmVlZGJhY2svP3I9JHtyYXRpbmd9JnA9JHtlbmNvZGVVUklDb21wb25lbnQocGxhdGZvcm0pfSZ2PSR7dmVyc2lvbn1gO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc05vZGUoKTogQm9vbGVhbiB7XG4gICAgcmV0dXJuICEhbm9kZVJlcXVpcmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VsZWN0cm9uKCk6IEJvb2xlYW4ge1xuICAgIHJldHVybiAhIWVsZWN0cm9uO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBwVmVyc2lvbigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmIChpc0VsZWN0cm9uKCkpIHtcbiAgICAgICAgcmV0dXJuIGVsZWN0cm9uLnJlbW90ZS5hcHAuZ2V0VmVyc2lvbigpO1xuICAgIH0gZWxzZSBpZiAoaXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgYXdhaXQgY29yZG92YVJlYWR5O1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb3Jkb3ZhLmdldEFwcFZlcnNpb24uZ2V0VmVyc2lvbk51bWJlcihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGlzQ2hyb21lQXBwKCkpIHtcbiAgICAgICAgcmV0dXJuIGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gXCJcIjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBsYXRmb3JtTmFtZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmIChpc0VsZWN0cm9uKCkpIHtcbiAgICAgICAgY29uc3QgcGxhdGZvcm0gPSBub2RlUmVxdWlyZShcIm9zXCIpLnBsYXRmb3JtKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXJ3aW46IFwiTWFjT1NcIixcbiAgICAgICAgICAgIHdpbjMyOiBcIldpbmRvd3NcIixcbiAgICAgICAgICAgIGxpbnV4OiBcIkxpbnV4XCJcbiAgICAgICAgfVtwbGF0Zm9ybV0gfHwgcGxhdGZvcm07XG4gICAgfSBlbHNlIGlmIChpc0NvcmRvdmEoKSkge1xuICAgICAgICBhd2FpdCBjb3Jkb3ZhUmVhZHk7XG4gICAgICAgIHJldHVybiBkZXZpY2UucGxhdGZvcm07XG4gICAgfSBlbHNlIGlmIChpc0Nocm9tZUFwcCgpKSB7XG4gICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBuZXcgUHJvbWlzZTx7b3M6IHN0cmluZ30+KChyKSA9PiBjaHJvbWUucnVudGltZS5nZXRQbGF0Zm9ybUluZm8ocikpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY3JvczogXCJDaHJvbWVPU1wiLFxuICAgICAgICAgICAgd2luOiBcIldpbmRvd3MgKENocm9tZSlcIixcbiAgICAgICAgICAgIGxpbnV4OiBcIkxpbnV4IChDaHJvbWUpXCIsXG4gICAgICAgICAgICBhbmRyb2lkOiBcIkFuZHJvaWQgKENocm9tZSlcIixcbiAgICAgICAgICAgIG1hYzogXCJNYWNPUyAoQ2hyb21lKVwiLFxuICAgICAgICAgICAgb3BlbmJzZDogXCJPcGVuQlNEIChDaHJvbWUpXCJcbiAgICAgICAgfVtpbmZvLm9zXSB8fCBpbmZvLm9zO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERlc2t0b3BTZXR0aW5ncygpOiBhbnkge1xuICAgIHJldHVybiBpc0VsZWN0cm9uKCkgPyBlbGVjdHJvbi5yZW1vdGUuZ2V0R2xvYmFsKFwic2V0dGluZ3NcIikgOiBudWxsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGV2aWNlVVVJRCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmIChpc0NvcmRvdmEoKSkge1xuICAgICAgICBhd2FpdCBjb3Jkb3ZhUmVhZHk7XG4gICAgICAgIHJldHVybiBkZXZpY2UudXVpZDtcbiAgICB9IGVsc2UgaWYgKGlzRWxlY3Ryb24oKSkge1xuICAgICAgICByZXR1cm4gZ2V0RGVza3RvcFNldHRpbmdzKCkuZ2V0KFwidXVpZFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRPU1ZlcnNpb24oKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBpZiAoaXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgYXdhaXQgY29yZG92YVJlYWR5O1xuICAgICAgICByZXR1cm4gZGV2aWNlLnZlcnNpb247XG4gICAgfSBlbHNlIGlmIChoYXNOb2RlKCkpIHtcbiAgICAgICAgcmV0dXJuIG5vZGVSZXF1aXJlKFwib3NcIikucmVsZWFzZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrRm9yVXBkYXRlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoaXNFbGVjdHJvbigpKSB7XG4gICAgICAgIGVsZWN0cm9uLmlwY1JlbmRlcmVyLnNlbmQoXCJjaGVjay11cGRhdGVzXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5vcGVuKGF3YWl0IGdldEFwcFN0b3JlTGluaygpLCBcIl9zeXN0ZW1cIik7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZURCQXMoKSB7XG4gICAgaWYgKGlzRWxlY3Ryb24oKSkge1xuICAgICAgICBlbGVjdHJvbi5pcGNSZW5kZXJlci5zZW5kKFwic2F2ZS1kYi1hc1wiKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkREIoKSB7XG4gICAgaWYgKGlzRWxlY3Ryb24oKSkge1xuICAgICAgICBlbGVjdHJvbi5pcGNSZW5kZXJlci5zZW5kKFwibG9hZC1kYlwiKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGUoKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPOiBJcyB0aGVyZSBhIG1vcmUgcmVsaWFibGUgd2F5IHRvIGdldCB0aGUgc3lzdGVtIGxvY2FsZSxcbiAgICAvLyBlLmcuIHRocm91Z2ggYGVsZWN0cm9uLnJlbW90ZS5hcHAuZ2V0TG9jYWxlKClgP1xuICAgIHJldHVybiBuYXZpZ2F0b3IubGFuZ3VhZ2UgfHwgXCJlblwiO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERldmljZUluZm8ge1xuICAgIHBsYXRmb3JtOiBzdHJpbmcsXG4gICAgb3NWZXJzaW9uOiBzdHJpbmcsXG4gICAgdXVpZDogc3RyaW5nLFxuICAgIGFwcFZlcnNpb246IHN0cmluZyxcbiAgICBtYW51ZmFjdHVyZXI/OiBzdHJpbmcsXG4gICAgbW9kZWw/OiBzdHJpbmcsXG4gICAgaG9zdE5hbWU/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERldmljZUluZm8oKTogUHJvbWlzZTxEZXZpY2VJbmZvPiB7XG4gICAgY29uc3QgaW5mbzogRGV2aWNlSW5mbyA9IHtcbiAgICAgICAgcGxhdGZvcm06IGF3YWl0IGdldFBsYXRmb3JtTmFtZSgpLFxuICAgICAgICBvc1ZlcnNpb246IGF3YWl0IGdldE9TVmVyc2lvbigpLFxuICAgICAgICBhcHBWZXJzaW9uOiBhd2FpdCBnZXRBcHBWZXJzaW9uKCksXG4gICAgICAgIHV1aWQ6IGF3YWl0IGdldERldmljZVVVSUQoKVxuICAgIH07XG5cbiAgICBpZiAoaXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgYXdhaXQgY29yZG92YVJlYWR5O1xuICAgICAgICBpbmZvLm1vZGVsID0gZGV2aWNlLm1vZGVsO1xuICAgICAgICBpbmZvLm1hbnVmYWN0dXJlciA9IGRldmljZS5tYW51ZmFjdHVyZXI7XG4gICAgfVxuXG4gICAgaWYgKGlzRWxlY3Ryb24oKSkge1xuICAgICAgICBpbmZvLmhvc3ROYW1lID0gbm9kZVJlcXVpcmUoXCJvc1wiKS5ob3N0bmFtZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBpbmZvO1xufVxuIiwiLy8gUkZDNDEyMi1jb21wbGlhbnQgdXVpZCBnZW5lcmF0b3JcbmV4cG9ydCBmdW5jdGlvbiB1dWlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwieHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4XCIucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PSBcInhcIiA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgY29uc3QgY2hhcnMgPSB7XG4gICAgbnVtYmVyczogXCIwMTIzNDU2Nzg5XCIsXG4gICAgbG93ZXI6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcbiAgICB1cHBlcjogXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlwiLFxuICAgIG90aGVyOiBcIi8rKCklXFxcIj0mLSE6JyojPzssXy5AYH4kXlt7XX1cXFxcfDw+XCJcbn07XG5cbmV4cG9ydCBjb25zdCBjaGFyU2V0cyA9IHtcbiAgICBmdWxsOiBjaGFycy5udW1iZXJzICsgY2hhcnMudXBwZXIgKyBjaGFycy5sb3dlciArIGNoYXJzLm90aGVyLFxuICAgIGFscGhhbnVtOiBjaGFycy5udW1iZXJzICsgY2hhcnMudXBwZXIgKyBjaGFycy5sb3dlcixcbiAgICBhbHBoYTogY2hhcnMubG93ZXIgKyBjaGFycy51cHBlcixcbiAgICBudW06IGNoYXJzLm51bWJlcnMsXG4gICAgaGV4YTogY2hhcnMubnVtYmVycyArIFwiYWJjZGVmXCJcbn07XG5cbi8vKiBDcmVhdGVzIGEgcmFuZG9tIHN0cmluZyB3aXRoIGEgZ2l2ZW4gX2xlbmd0aF8gY29tcHJpc2VkIG9mIGdpdmVuIHNldCBvciBjaGFyYWN0ZXJzXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tU3RyaW5nKGxlbmd0aCA9IDMyLCBjaGFyU2V0ID0gY2hhclNldHMuZnVsbCkge1xuICAgIGxldCBybmQgPSBuZXcgVWludDhBcnJheSgxKTtcbiAgICBsZXQgc3RyID0gXCJcIjtcbiAgICB3aGlsZSAoc3RyLmxlbmd0aCA8IGxlbmd0aCkge1xuICAgICAgICB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhybmQpO1xuICAgICAgICAvLyBQcmV2ZW50IG1vZHVsbyBiaWFzIGJ5IHJlamVjdGluZyB2YWx1ZXMgbGFyZ2VyIHRoYW4gdGhlIGhpZ2hlc3QgbXVsaXBsZSBvZiBgY2hhclNldC5sZW5ndGhgXG4gICAgICAgIGlmIChybmRbMF0gPiAyNTUgLSAyNTYgJSBjaGFyU2V0Lmxlbmd0aCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgc3RyICs9IGNoYXJTZXRbcm5kWzBdICUgY2hhclNldC5sZW5ndGhdO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVib3VuY2UoZm46ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55LCBkZWxheTogbnVtYmVyKSB7XG4gICAgbGV0IHRpbWVvdXQ6IG51bWJlcjtcblxuICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBmbihhcmdzKSwgZGVsYXkpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0KGR0OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZHQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVMYW5ndWFnZShsb2NhbGU6IHN0cmluZywgc3VwcG9ydGVkTGFuZ3VhZ2VzOiB7IFtsYW5nOiBzdHJpbmddOiBhbnkgfSk6IHN0cmluZyB7XG4gICAgY29uc3QgbG9jYWxlUGFydHMgPSBsb2NhbGUudG9Mb3dlckNhc2UoKS5zcGxpdChcIi1cIik7XG5cbiAgICB3aGlsZSAobG9jYWxlUGFydHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGwgPSBsb2NhbGVQYXJ0cy5qb2luKFwiLVwiKTtcbiAgICAgICAgaWYgKHN1cHBvcnRlZExhbmd1YWdlc1tsXSkge1xuICAgICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH1cblxuICAgICAgICBsb2NhbGVQYXJ0cy5wb3AoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc3VwcG9ydGVkTGFuZ3VhZ2VzKVswXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5TWl4aW5zKGJhc2VDbGFzczogYW55LCAuLi5taXhpbnM6ICgoY2xzOiBhbnkpID0+IGFueSlbXSk6IGFueSB7XG4gICAgcmV0dXJuIG1peGlucy5yZWR1Y2UoKGNscywgbWl4aW4pID0+IG1peGluKGNscyksIGJhc2VDbGFzcyk7XG59XG4iXX0=
