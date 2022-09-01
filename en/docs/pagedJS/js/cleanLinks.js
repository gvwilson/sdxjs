class linkCleaning extends Paged.Handler {
    // this let us call the methods from the the chunker, the polisher and the caller for the rest of the script
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }

    beforeParsed(content) {
        //   Before the content is parsed by Paged.js, please do the follwing:

        // first, look for all the links <a> that are referencing a link started by http or www
        const links = content.querySelectorAll('a[href^="http"], a[href^="www"]');
        // for each of those links,
        links.forEach((link) => {
            // Break after a colon or a double slash (//) or before a single slash (/), a tilde (~), a period, a comma, a hyphen, an underline (_), a question mark, a number sign, or a percent symbol.
            const content = link.textContent;
            let printableUrl = content.replace(/\/\//g, "//\u003Cwbr\u003E");
            printableUrl = printableUrl.replace(/\,/g, ",\u003Cwbr\u003E");
            // put a <wbr> element around to define where to break the line.
            printableUrl = printableUrl.replace(
                /(\/|\~|\-|\.|\,|\_|\?|\#|\%)/g,
                "\u003Cwbr\u003E$1"
            );
            // turn hyphen in non breaking hyphen
            printableUrl = printableUrl.replace(/\-/g, "\u003Cwbr\u003E&#x2011;");
            // add a data-print-url to keep track of the previous link
            link.setAttribute("data-print-url", content);
            // modify the inner text of the link
            link.innerHTML = printableUrl;
        });
    }
}

// and we don’t forget to register the handler like this

Paged.registerHandlers(linkCleaning);