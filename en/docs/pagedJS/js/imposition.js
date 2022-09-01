//to do change units BY LOOKING FOR THEM

class Booklet extends Paged.Handler {
    constructor(chunker, polisher, caller) {
      super(chunker, polisher, caller);
      this.pagedbooklet;
      this.sourceSize;
    }
    onAtPage(node, item, list) {}
    onDeclaration(declaration, dItem, dList, rule) {
      if (declaration.property == "--paged-layout") {
        if (declaration.value.value.includes("booklet")) {
          this.pagedbooklet = true;
        }
      }
    }
    afterRendered(pages) {
      let format = document.querySelector(".pagedjs_page");
  
      let width = getCSSCustomProp("--pagedjs-width", format);
      let height = getCSSCustomProp("--pagedjs-height", format);
  
      var newSize = `@media print{
            @page{
              size:  ${width.replace("mm", "") * 2}mm ${height};
            }
              .pagedjs_page:nth-of-type(even){
                  break-after: always;
              }
              .pagedjs_pages {
                  width: auto;
                  display: flex !important;
                  flex-wrap: wrap;
                  transform: none !important;
                  height: 100% !important;
                  min-height: 100%;
                  max-height: 100%;
                  overflow: visible;
              }
              .pagedjs_page {
                  margin: 0;
                  padding: 0;
                  max-height: 100%;
                  min-height: 100%;
                  height: 100% !important;
  
              }
  
              .pagedjs_sheet {
                  margin: 0;
                  padding: 0;
                  max-height: 100%;
                  min-height: 100%;
                  height: 100% !important;
              }
  
          }
          .pagedjs_first_page {
                  margin-left: 0;
          }
          body{
              margin: 0
          }
          `;
  
      if (this.pagedbooklet == true) {
        let style = document.createElement("style");
        style.textContent = newSize;
        document.head.appendChild(style);
  
        // var pages = document.querySelectorAll('.pagedjs_page');
        //
        // var array = []
        //
        // pages.forEach((page, i) => {
        // 	array.push(page);
        // });
        // console.log(array);
        //
        // var splitStart = array.length / 2;
        // var splitEnd = array.length;
        //
        // var first_array = array.slice(0,splitStart);
        // var second_array = array.slice(splitStart,splitEnd);
        // console.log(second_array);
        var number_of_pages = document.querySelectorAll(".pagedjs_page").length;
  
        // number_of_pages = parseInt(prompt('How many pages ?'));
  
        // Create an array for pages
  
        var pages_array = [];
  
        // If the page count isn't a multiple of 4, we need to
        // pad the array with blank pages so we have the correct
        // number of pages for a booklet.
        //
        // ex. [1, 2, 3, 4, 5, 6, 7, 8, 9, blank, blank, blank]
  
        var additional_pages = 4 - (number_of_pages % 4);
        // console.log(additional_pages);
        for (i = 0; i < additional_pages; i++) {
          let added_page = document.createElement("div");
          added_page.classList.add("pagedjs_page", "added");
          // added_page.style.background = 'orange';
          added_page.id = `page-${number_of_pages + i + 1}`;
          document.querySelector(".pagedjs_pages").appendChild(added_page);
        }
  
        // Push each page in the array
  
        for (var i = number_of_pages + additional_pages; i >= 1; i--) {
          pages_array.push(i);
        }
  
        console.log(number_of_pages + additional_pages)
  
        console.log('pages_array',pages_array)
  
  
        // Split the array in half
        //
        // ex. [1, 2, 3, 4, 5, 6], [7, 8, 9, blank, blank, blank]
  
        var split_start = pages_array.length / 2;
  
        var split_end = pages_array.length;
  
        var first_array = pages_array.slice(0, split_start);
        var second_array = pages_array.slice(split_start, split_end);
  
        // Reverse the second half of the array.
        // This is the beginning of the back half of the booklet
        // (from the center fold, back to the outside last page)
        //
        // ex. [blank, blank, blank, 9, 8, 7]
  
        var second_array_reversed = second_array.reverse();
  
        // Zip the two arrays together in groups of 2
        // These will end up being each '2-up side' of the final document
        // So, the sub-array at index zero will be the first side of
        // physical page one and index 1 will be the back side.
        // However, they won't yet be in the proper order.
        //
        // ex. [[1, blank], [2, blank], [3, blank], [4, 9], [5, 8], [6, 7]]
  
        var page_groups = [];
        for (var i = 0; i < first_array.length; i++) {
          page_groups[i] = [first_array[i], second_array_reversed[i]];
        }
  
        // We need to reverse every other sub-array starting with the
        // first side.
        // This is the final step of aligning our booklet pages in
        // the order with which the booklet gets printed and bound.
        //
        // ex. [[blank, 1], [2, blank], [blank, 3], [4, 9], [8, 5], [6, 7]]
  
        //final_groups = page_groups.each_with_index { |group, index| group.reverse! if (index % 2).zero? }
        var final_groups = [];
        for (var i = 0; i < page_groups.length; i++) {
          var group = page_groups[i];
          if (i % 2 != 0) {
            final_groups[i] = page_groups[i].reverse();
          } else {
            final_groups[i] = page_groups[i];
          }
        }
        console.log("Final Imposition Order: " + final_groups);
  
        var allPages = document.querySelectorAll(".pagedjs_page");
  
        var final_flat = final_groups.flat();
  
        final_flat.forEach((folio, i) => {
          document.querySelector(`#page-${folio}`).style.order = i;
        });
      }
    }
  }
  Paged.registerHandlers(Booklet);
  
  /**
   * Pass in an element and its CSS Custom Property that you want the value of.
   * Optionally, you can determine what datatype you get back.
   *
   * @param {String} propKey
   * @param {HTMLELement} element=document.documentElement
   * @param {String} castAs='string'
   * @returns {*}
   */
  const getCSSCustomProp = (
    propKey,
    element = document.documentElement,
    castAs = "string"
  ) => {
    let response = getComputedStyle(element).getPropertyValue(propKey);
  
    // Tidy up the string if there's something to work with
    if (response.length) {
      response = response.replace(/\'|"/g, "").trim();
    }
  
    // Convert the response into a whatever type we wanted
    switch (castAs) {
      case "number":
      case "int":
        return parseInt(response, 10);
      case "float":
        return parseFloat(response, 10);
      case "boolean":
      case "bool":
        return response === "true" || response === "1";
    }
  
    // Return the string response by default
    return response;
  };
  