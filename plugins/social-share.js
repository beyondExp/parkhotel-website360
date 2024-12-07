function krpanoplugin()
{
    var local = this;   // save the 'this' pointer from the current plugin object

    var krpano = null;  // the krpano and plugin interface objects
    var plugin = null;

    var xml_value = 100.0;   // the value for a custom xml attribute

    // registerplugin - startup point for the plugin (required)
    // - krpanointerface = krpano interface object
    // - pluginpath = the fully qualified plugin name (e.g. "plugin[name]")
    // - pluginobject = the xml plugin object itself
    local.registerplugin = function(krpanointerface, pluginpath, pluginobject)
    {
        // get the krpano interface and the plugin object
        krpano = krpanointerface;
        plugin = pluginobject;

        // first - say hello
        krpano.trace(1, "hello from plugin[" + plugin.name + "]");

        // add plugin attributes
        plugin.registerattribute("mode", "normal");
        plugin.registerattribute("value", xml_value, value_setter, value_getter);

        // add plugin action (the attribute needs to be lowercase!)
        plugin.dosomething = action_dosomething;

        // optionally - add some graphical content:

        // register the size of the content
        plugin.registercontentsize(100,50);

        // use 100% width/height for automatic scaling with the plugin size
        var text = document.createElement("div");
        text.style.cssText = "width:100%;height:100%;"+
            "display:flex;color:white;background:#000;"+
            "align-items:center;justify-content:center;text-align:center;";
        text.innerHTML = "Share";

        // the plugin 'sprite' variable is the internal html element of the plugin
        plugin.sprite.appendChild(text);
    }

    // unloadplugin - exit point for the plugin (optionally)
    // - will be called from krpano when the plugin will be removed
    // - everything that was added by the plugin should be removed here
    local.unloadplugin = function()
    {
        plugin = null;
        krpano = null;
    }

    // onresize (optionally)
    // - width,height = the new size for the plugin
    // - when not defined then only the krpano plugin html element will be sized
    local.onresize = function(width,height)
    {
        // not used in this example
        // the plugin content will resize automatically because
        // of the width=100%, height=100% CSS style
        return false;
    }

    function value_setter(newvalue)
    {
        if (newvalue != xml_value)
        {
            krpano.trace(1, "'value' will be changed from " + xml_value + " to " + newvalue);
            xml_value = newvalue;
        }
    }

    function value_getter()
    {
        return xml_value;
    }

    function action_dosomething()
    {
        // trace the given action arguments
        krpano.trace(1, "dosomething() was called with " + arguments.length + " arguments:");

    }
}