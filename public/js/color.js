function ColorController() {
    var SATURATION = 30;
    var LUMINANCE = 50;
    
    var $picker = $("#color-picker");
        
    this.setbg = function (hue) {
        var hsl = "hsl(" + hue + "," + SATURATION + "%," + LUMINANCE + "%)";
        $("body").css("background-color", hsl);
    };
    
    this.change = function (handler) {
        $picker.on("input", function (e) {
            handler($picker.val());
        });
    };
    
    this.hex = function (hue) {
        var color = tinycolor({
            h: hue,
            s: SATURATION,
            l: LUMINANCE
        });
        
        return parseInt(color.toHex(), 16);
    };
    
    this.randomColor = function () {
        var hue = Math.random() * 360;
        return this.hex(hue);
    };
}