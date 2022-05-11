// Reload-in-place v1.3
// Nicolas Taffin + Sameh Chafik - 2020
// MIT License https://opensource.org/licenses/MIT
// A simple script to add your pagedjs project. On reload, it will make the web browser scroll to the place it was before reload. 
// Useful when styling or proof correcting your book. Multi docs compatible and doesn't wait for complete compilation to go.


console.log("reload in place");


// separate human / machine scroll
var machineScroll = false;

// check pagedJS ended compilation
var pagedjsEnd = false;

class pagedjsEnded extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }
    afterRendered(pages) {
        pagedjsEnd = true;
    }
}
Paged.registerHandlers(pagedjsEnded);

// set a "unique" filename based on title element, in case several books are opened
var fileTitle = document.getElementsByTagName("title").text;

function getDocHeight() {
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    )
}

function saveAmountScrolled() {
    var scrollArray = [];
    var scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
    if (!machineScroll) {
        var scrollLeft = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft
        scrollArray.push({ X: Math.round(scrollLeft), Y: Math.round(scrollTop) });
        console.log("Saved ", scrollArray);
        localStorage[fileTitle] = JSON.stringify(scrollArray);
    }
}

// on Load, blur or opacify the page, and try to join ASAP 
// last saved position, or at least last compiled page

window.onload = function() {
    machineScroll = true;
    var styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    var styleSheet = styleEl.sheet;
    // uncomment one of the two options :
    // nice but high calculation usage : blur until scrolled
    styleSheet.insertRule('.pagedjs_pages { filter: blur(4px); }', 0);
    // less power consumption: low opacity until scrolled
    //styleSheet.insertRule('.pagedjs_pages { opacity: 0.3; }', 0); 
    var savedData = localStorage.getItem(fileTitle);
    if (savedData) {
        var scrollArray = JSON.parse(savedData);
        var scrollTop = scrollArray[0].Y;
        var scrollLeft = scrollArray[0].X;
    } else {
        var scrollTop = 0;
        var scrollLeft = 0;
    }
    var winheight = window.innerHeight || (document.documentElement || document.body).clientHeight
    window.currentInterval = setInterval(function() {
        var docheight = getDocHeight();

        if (scrollTop > 0 && scrollTop > docheight - winheight && !pagedjsEnd) {
            window.scrollTo(scrollLeft, docheight);
        } else {
            window.scrollTo(scrollLeft, scrollTop);
            clearInterval(window.currentInterval);
            setTimeout(function() {
                window.scrollTo(scrollLeft, scrollTop);
                machineScroll = false;
                styleSheet.deleteRule(0);
            }, 100);
        }
    }, 50);
};

// slow down a bit save position pace

var slowSave = debounce(function() {
    if (!machineScroll) {
        saveAmountScrolled();
    }
}, 100);

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

// Scroll triggers save, but not immediately on load

setTimeout(function() {
    window.addEventListener('scroll', slowSave);
}, 1000);