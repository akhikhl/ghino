load("gino/services.js");

(function(global) {

  return function(scriptName, args, initServices) { // boot function
    
    args = toJavascript(args);
    
    logger.trace("boot '{}', args={}", toJavaArray([scriptName, toJSON(args)]));

    Object.defineProperty(global, "homeFolder", {
      value: new java.io.File(".").getAbsolutePath(),
      writable: false
    });
  
    let obj = load(scriptName);
    
    let mainFunc, beforeMain, afterMain;    
    if(typeof obj == "object") {
      if(typeof obj.main == "function")
        mainFunc = obj.main;
      if(typeof obj.beforeMain == "function")
        beforeMain = obj.beforeMain;
      if(typeof obj.afterMain == "function")
        afterMain = obj.afterMain;
    } else if(typeof obj == "function")
      mainFunc = obj;
    else if(typeof global.main == "function")
      mainFunc = global.main;
  
    if(!mainFunc)
      throw new Error("main function is undefined");
    
    let result = null;
    
    let domains = [];
    if(beforeMain)
      beforeMain(args, domains);
    try {
      if(initServices) {
        services.initServices(domains);
        try {
          services.integrateServices(domains);
          result = mainFunc(args, domains);
        } finally {
          services.disposeServices(domains);
        }
      } else
        result = mainFunc(args, domains);
    } finally {
      if(afterMain)
        afterMain(args, domains);
    }
    
    return result;
  }
})(this);
