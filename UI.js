function UI(creator) {
}

function Html() {
    
    this.getCharGrid = function(char, width, height) {
        var div = $("<div id='grit-of-char-"+char+"'></div>");
        var table = $("<table></table>");
        var tr, td;
        div.addClass("grid-holder");
        for (var cols = 0; cols < height; cols++) {
            tr = $("<tr></tr>");
            for (var rols = 0; rols < width; rols++) {
                td = $("<td></td>");
                td.addClass("grid-cell");
                td.addClass("grid-cell-" + rols + "-" + cols);
                tr.append(td);
            }
            table.append(tr);
        }
        div.append(table);
        return div;
    }
}
