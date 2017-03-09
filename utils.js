function extend(Child, Parent) {
    var F = function () {};
    F.prototype = Parent.prototype;

    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.super = Parent.prototype;
}

function loadTextFileAjaxSync(filePath, mimeType) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    if(mimeType != null) {
        if(xmlhttp.overrideMimeType) {
            xmlhttp.overrideMimeType(mimeType);
        }
    }
    xmlhttp.send();
    if(xmlhttp.status == 200) {
        return xmlhttp.responseText;
    }
    else {
        // TODO Throw exception
        return null;
    }
}
