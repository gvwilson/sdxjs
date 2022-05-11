// Hook for the floating figures
let classElemFloat = "elem-float-top"; // ← class of floated elements

class elemFloatTop extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
        this.floatPageEls = [];
        this.token;
    }

    layoutNode(node) {
        // If you find a float page element, move it in the array,
        if (node.nodeType == 1 && node.classList.contains(classElemFloat)) {
            let clone = node.cloneNode(true);
            this.floatPageEls.push(clone);
            // Remove the element from the flow by hiding it.
            node.style.display = "none";
        }
    }

    beforePageLayout(page, content, breakToken) {
        // If there is an element in the floatPageEls array,
        if (this.floatPageEls.length >= 1) {
            // Put the first element on the page.
            page.element
                .querySelector(".pagedjs_page_content")
                .insertAdjacentElement("afterbegin", this.floatPageEls[0]);
            this.floatPageEls.shift();
        }
    }
}
Paged.registerHandlers(elemFloatTop);


// Hook for the footnotes
class bibref extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }

    beforeParsed(content) {
        const bibref = content.querySelectorAll("a");
        bibref.forEach(ref => {
            if (ref.href.includes("alll.html#")) {
                return
            }
            if (ref.classList.contains('figref')) {
                return
            }
            if (ref.classList.contains('tblref')) {
                return
            }
            if (ref.classList.contains('linkref')) {
                return
            }
            if (ref.href.includes("/bibliography/#")) {
                ref.href = ref.href.replace("/bibliography/#", "/#");
                ref.classList.add("biblio");
            } else {
                const footnote = document.createElement("span");
                footnote.classList.add("footnote");
                footnote.innerHTML = ref.href;
                ref.insertAdjacentElement("afterend", footnote);
                ref.classList.add("external");
            }
        });
    }

}
Paged.registerHandlers(bibref);