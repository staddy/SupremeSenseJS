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

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
/*
 It is just a quick & dirty way to check if "function decompilation" works.
 The RegExp.prototype.test method will take the argument and it will convert
 it to String, the xyz reference inside the function is never evaluated.
 Why would you have to check this?
 Because the Function.prototype.toString method returns an implementation-dependent
 representation of a function, and in some implementation, such older Safari versions,
 Mobile Opera, and some Blackberry browsers, they don't actually return anything useful.
                                                                            CMS
 */

// The base Class implementation (does nothing)
var Class = function(){};

// Create a new Class that inherits from this class
Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don’t run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
        // Check if we’re overwriting an existing function
        prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function(name, fn){
                return function() {
                    var tmp = this._super;

                    // Add a new ._super() method that is the same method
                    // but on the super-class
                    this._super = _super[name];

                    // The method only need to be bound temporarily, so we
                    // remove it when we’re done executing
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;

                    return ret;
                };
            })(name, prop[name]) :
            prop[name];
    }

    // The dummy class constructor
    function Class() {
    // All construction is actually done in the init method
        if ( !initializing && this.init )
            this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
};