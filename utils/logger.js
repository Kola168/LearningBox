/**
 *ERROR level指出虽然发生错误事件，但仍然不影响系统的继续运行。
 *WARN level表明会出现潜在错误的情形。
 *INFO level指普通消息。
 *DEBUG  level指所有消息。
 */
const machine = "real";//real 真机，simulator 模拟器
const loggerlevel = "INFO"; //日志打印级别 ERROR、WARN、INFO、DEBUG

function getLogger(inamespace) {
  const level = loggerlevel.toUpperCase();
  const namespace = inamespace == undefined || inamespace == null ? '' : inamespace;
  this.error = function() {
    if (level == "ERROR" || level == "DEBUG") {
      consoleTemplate("green", "red", "error", namespace,machine, arguments);
    }
  }
  this.warn = function() {
    if (level == "WARN" || level == "DEBUG") {
      consoleTemplate("green", "yellow", "warn", namespace, machine, arguments);
    }
  }
  this.info = function() {
    if (level == "INFO" || level == "DEBUG") {
      consoleTemplate("green", "#4a88ee", "info", namespace, machine, arguments);
    }
  }
  this.debug = function() {
    if (level == "DEBUG") {
      consoleTemplate("green", "grey", "debug", namespace, machine, arguments);
    }
  }
}

function consoleTemplate() {
  console.log(
    "[%c%s%c] Line%i %c%s%c   %s:", "color:" + arguments[0],
    loggerformatTime(new Date()), "color:black", arguments[5].length,  "color:" + arguments[1],
    arguments[2], "color:black", arguments[3]
  );
  for (let li = 0; li < arguments[5].length; li++) {
    consolePrint((li + 1), arguments[5][li]);
  }
  if (arguments[4].toUpperCase() =="SIMULATOR"){
    console.groupCollapsed("追踪函数的调用轨迹:");
    console.trace();
    console.groupEnd();
  }
}

// 运算数为数字 typeof (x) = "number"
// 字符串 typeof (x) = "string"
// 布尔值 typeof (x) = "boolean"
// 对象, 数组和null typeof (x) = "object"
// 函数 typeof (x) = "function" 
function consolePrint(li, obj) {
  const type = typeof obj;
  switch (type) {
    case "number":
      console.log("L" + li + " --->%s", obj);
      break;
    case "string":
      console.log("L" + li + " --->%s", obj);
      break;
    case "boolean":
      console.log("L" + li + " --->%s", obj);
      break;
    case "object":
      if (Object.prototype.toString.call(obj) == '[object Array]') {
        console.log("L" + li + " --->[" + obj[0] + "]:%o", obj[1]);
      } else {
        console.log("L" + li + " --->%o", obj);
      }
      break;
    case "function":
      console.log("L" + li + " --->%s", "function");
      break;
    case "undefined":
      console.log("L" + li + " --->%s", "undefined");
      break;
    default:
      console.log("L" + li + " --->%s", "default");
  }
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//获取一个时间的年月日时分秒毫秒
const loggerformatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  const millisecond = date.getMilliseconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second, millisecond].map(formatNumber).join(':')
}

module.exports = {
  GetLogger: getLogger
}