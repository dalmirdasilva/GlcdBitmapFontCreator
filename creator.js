function Creator() {
    
    this.useDefault = true;
    this.width;
    this.height;
    this.sequences;
    this.outputBase = 10;
    this.html = new Html();
    
    this.init = function() {
        
        var self = this;
        
        $("#grid-value").blur(function() {
            self.updateGridFromInput();
            self.updateGridFromInput();
        });
        $("#add-char-to-grid-button").click(function() {
            var v = $("#add-char-to-grid-value").val();
            if (v) {
                self.addCharGridToHolder();
            } else {
                $("#add-char-to-grid-value").focus();
            }
        });
        $("#setitup").click(function() {
            if ($(".char-list-to-chose:checked").size() < 1) {
                alert("At least one char must be checked.");
                return;
            }
            $("#step1").hide();
            $("#step2").show();
            self.goTo2ndStep();
        });
        $("#back-to-setup").click(function() {
            $("#step1").show();
            $("#step2").hide();
        });
        $("#select-all").click(function() {
            $(".char-list-to-chose").attr("checked", "checked");
        });
        $("#select-none").click(function() {
            $(".char-list-to-chose").removeAttr("checked");
        });
        $("#generate-output-code").click(function() {
            self.generateOutputCode();
        });
    };
    
    this.generateOutputCode = function() {
        var output = "";
        var header = this.generateHeaderOutputCode();
        var body = this.generateBodyOutputCode();
        output += "// Font (https://github.com/dalmirdasilva/ArduinoGlcdLibrary/tree/master/GlcdBitmapFont)\n\n// header\n";
        output += header.join(", ") + ", ";
        output += "\n\n// body\n";
        output += body.join(", ");
        $("#output-code").text(output);
    };
    
    this.generateHeaderOutputCode = function() {
        var result = new Array();
        var offset = 4 + (4 * this.sequences.length);
        result.push(this.toS(0)); // info
        result.push(this.toS(this.width)); // width
        result.push(this.toS(this.height)); // height
        result.push(this.toS(this.sequences.length)); // Sequence count
        // each sequence
        for (var i = 0; i < this.sequences.length; i++) {
            result.push(this.toS(this.sequences[i][0])); // First character
            result.push(this.toS(this.sequences[i][this.sequences[i].length - 1])); // Last character
            result.push(this.toS((offset & 0xff00) >> 8)); // Offset MSB
            result.push(this.toS(offset & 0xff)); // Offset LSB
            offset += this.sequences[i].length * this.width * (this.height / 8);
        }
        return result;
    };
    
    this.generateBodyOutputCode = function() {
        var result = new Array();
                
        for (var i = 0; i < this.sequences.length; i++) {
            for (var j = 0; j < this.sequences[i].length; j++) {
                for (k = 0; k < this.height / 8; k++) {
                    for (w = 0; w < this.width; w++) {
                        var b = 0x00;
                        for (h = 0; h < this.height; h++) {
                            var p = k * 8 + h;
                            var id = "cell-"+i+"-"+j+"-"+p+"-"+w;
                            if ($("#"+id).hasClass("selected-cell")) {
                                b |= 1 << (7-h);
                            }
                        }
                        result.push(this.toS(b));
                    }
                }
            }
        }
        return result;
    };
    
    this.goTo2ndStep = function() {
        this.setupParameters();
        this.createAllGrids();
    };
    
    this.toS = function(i) {
        this.outputBase = parseInt($("#output-base").val());
        var prf = "";
        switch(this.outputBase) {
            case 16:
                prf = "0x";
                break;
            case 8:
                prf = "0";
                break;
            case 2:
                prf = "b";
                break;
        }
        return prf + i.toString(this.outputBase);
    };
    
    this.setupParameters = function() {
        this.sequences = new Array();
        this.width = parseInt($("#char-width").val());
        this.useDefault = $("#use-default").attr("checked");
        this.height = parseInt($("#char-height").val());
        var chars = $(".char-list-to-chose:checked");
        var lastCode = 0;
        for (var i = 0; i < chars.size(); i++) {
            var entry = chars.get(i);
            var code = $(entry).val();
            if (code > (lastCode + 1)) {
                this.sequences.push([]);
            }
            lastCode = parseInt(code);
            this.sequences[this.sequences.length - 1].push(lastCode);
        }
    };
    
    this.createAllGrids = function() {
        var holder = $("#chars-holder").html("");
        for (var i = 0; i < this.sequences.length; i++) {
            for (var j = 0; j < this.sequences[i].length; j++) {
                var code = this.sequences[i][j];
                this.createTheCharGridAndAppendToHolder(i, j, code);
            }
        }
    };
        
    this.createTheCharGridAndAppendToHolder = function(sequence, index, code) {
        var self = this;
        var holder = $("#chars-holder");
        var ch = $("<div id='final-char-"+sequence+"-"+index+"'></div>");
        var body = $("<div class='char-grid'></div>");
        var title = $("<div class='char-title'><span>-</span> char: <span>&nbsp;" + String.fromCharCode(code) + "&nbsp;</span> code: <span>" + this.toS(code) + "</span></div>").click(function() {
            $(this).next().toggle();
            var span = $(this).find("span:first");
            if (span.text() == "+") {
                span.text("-");
            } else {
                span.text("+");
            }
        });
        ch.append(title);
        ch.append(body);
        var table = $("<table class='char-grid-table' cellspacing='1' cellpadding='0' border='0'></table>");
        body.append(table);
        for (var k = 0; k < this.height; k++) {
            var tr = $("<tr></tr>");
            for (var j = 0; j < this.width; j++) {
                var td = $("<td></td>");
                var defClass = "unselected-cell";
                if (this.useDefault) {
                    var data = defaultFont[code - 32];
                    if (data != "undefined") {
                        var b = data[j];
                        if((b & 0x01 << k) != 0) {
                            defClass = "selected-cell";
                        }
                    }
                }
                var id = "cell-"+sequence+"-"+index+"-"+k+"-"+j;
                var cell = $("<div id='"+id+"' class='grid-cell " + defClass + "'>&nbsp</div>").click(function() {
                    if($(this).hasClass("selected-cell")) {
                        $(this).removeClass("selected-cell").addClass("unselected-cell");
                    } else {
                        $(this).removeClass("unselected-cell").addClass("selected-cell");
                    }
                });
                td.append(cell);
                tr.append(td);
            }
            table.append(tr);
        }
        holder.append(ch);
    };
}
