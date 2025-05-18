
// ==UserScript==
// @name         元素检测自动刷新
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  当指定元素出现时自动刷新页面
// @author       PaperCupsRay
// @match        https://idx.google.com/*
// @match        https://*.cloudworkstations.dev/*
// @grant        none
// ==/UserScript==

// 手动实现字符串补零
function padStart(str, targetLength, padChar = '0') {
    if (str.length >= targetLength) return str;
    return padChar.repeat(targetLength - str.length) + str;
}

//显示计时函数
function FormatTime(format, seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return format
        .replace('DD', padStart(days.toString(), 2))
        .replace('HH', padStart(hours.toString(), 2))
        .replace('mm', padStart(minutes.toString(), 2))
        .replace('ss', padStart(secs.toString(), 2));
}

function getUrlParamsFromUrl(urlStr) {
    const url = new URL(urlStr);
    const searchParams = new URLSearchParams(url.search);
    const params = {};
    for (const [key, value] of searchParams.entries()) {
        params[key] = value;
    }
    return params;
}

// 定义一个函数来获取 XPath 表达式对应的元素
function getElementByXpath(path, doc) {
    return doc.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

(function () {
    'use strict';

    if (window == window.top) {
        //超时自动刷新
        const timeout = 1000 * 60 * 4;
        const outID = setTimeout(()=>{
            window.location = window.location;
        }, timeout);
        console.log(`${FormatTime("HH时mm分ss秒",timeout/1000)}后若超时将自动刷新重进`);
        window.addEventListener('message', e => {
            console.log(e.data);
            if (e.data.myMessage) {
                switch(e.data.myMessage.command)
                {
                    case "reload":
                        window.location = window.location;
                        break;
                    case "loaded":
                        console.log("清除超时刷新计时");
                        clearTimeout(outID);
                        break;
                }
            }
        });

    } else {
        const url_p = getUrlParamsFromUrl(location.href);
        if (url_p.folder != null) {
            window.top.postMessage({
                myMessage: {
                    command: "loaded"
                }
            }, '*');
            const checkInterval = 1000;
            let pop = null;
            const checkID = setInterval(() => {
                pop = document.getElementById("monaco-dialog-message-detail")
                if (pop != null) {
                    console.log("3秒后刷新")
                    clearInterval(checkID);
                    setTimeout(() => {
                        window.top.postMessage({
                            myMessage: {
                                command: 'reload'
                            }
                        }, '*');
                    }, 3000);
                }
            }, checkInterval);
        }
    }
})();
