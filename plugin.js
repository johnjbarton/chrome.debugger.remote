// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*jslint browser:true*/
/*global require window eclipse console*/

require({
  paths: {
    'crx2app': 'lib/crx2app/extension'
  }
});

require(['crx2app/appEnd/connection', 'crx2app/rpc/ChromeProxy','orion/serviceregistry', 'dojo/_base/Deferred'], 
function(                connection,               ChromeProxy,       serviceregistry,               Deferred) {
  
  var urlParams = window.location.toString().split('?')[1];
  if (typeof urlParams === 'string') {
    var debugParam = urlParams.indexOf('debug=');
    var debugValue = urlParams.substr(debugParam+'debug='.length);
    window.debugChromeDebuggerRemote = debugValue;
  }
  
  function createChromeProxy(connection, serviceregistry) {
    var chromeEventHandlers = serviceregistry.getService("chrome.extension.eventHandlers");
    
    // wrap the connection in rpc stuff for chrome.* api
    var chromeProxy = ChromeProxy.new(connection, chromeEventHandlers);
    return chromeProxy;
  }
  
  var chromeDebugger = {
    openDebuggerProxy: function(url) {
    
      var deferred = new Deferred();
    
      connection.attach( function onAttach() {
        var chromeProxy = createChromeProxy(connection, serviceregistry);
      
        var debuggerEventHandlers = serviceregistry.getService("chrome.debugger.eventHandlers");
      
        // wrap the connection in more rpc stuff for remote debug protocol through chrome.debugger,
        // and attach to a new tab, enable debugging and update the page to the given URL.
      
        var debuggerProxy = chromeProxy.openDebuggerProxy(url, debuggerEventHandlers);
     
        deferred.resolve(debuggerProxy);
      });
      
      return deferred;
    }
  };
  
  function registerDebugAPI(chromeDebugger) {
  
    var provider = new eclipse.PluginProvider();
    provider.registerServiceProvider("chrome.debugger.opener",
      chromeDebugger,
      {  name: "Chrome Debugger API",
          id: "chrome.debugger.opener"
      }
    );
    
    provider.connect(
      function callback(){
        console.log("chrome.debugger.remote connected, home page: https://github.com/johnjbarton/chrome.debugger.remote");
      },
      function errback() {
        console.log("chrome.debugger.remote Plugin Error: ", arguments);
      }
    );
  }
  
  registerDebugAPI(chromeDebugger);

});