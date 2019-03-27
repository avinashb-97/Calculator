var currentNum = "0";
var lastNum = [];
var $lastOperator = "";
var displayNum = "0";
var equalsBtn = false;
var hasDecimal = false;
var clearBtn = false;
var chainAdd = false;
var $displayTxt;
var $orangeButtons;

$(document).ready(function() {
  $displayTxt = $("#displayTxt");
  $orangeButtons = $(".btnO");
  $("#display").text(eval(""));
  $("button").mousedown(function() { UIDown($(this)); });
  $("button").mouseup(function() {
    calculate($(this));
    lengthChecker($displayTxt.text());
    UIUp($(this));
  });

});

var isSymbol = function(char) {
  return char === '+' || char === '-' || char === '=' || char === '/' || char === '*';
}

var getButton = function(obj) {
  if (obj.attr("value") === '.')
    return 'decimal';
  if (obj.is(".btnG"))
    return 'number';

  if (obj.attr("value") === '=')
    return 'equals';
  if (obj.is(".btnO"))
    return 'symbol';

  if (obj.is(".btnDG"))
    return 'darkGray';
}

var calculate = function(obj) {

  switch (getButton(obj)) {
    case 'decimal':
      if (!hasDecimal && evaluator(currentNum).toString().length <= 9) {
        hasDecimal = true;
        if (equalsBtn) {
          displayNum = "";
          equalsBtn = false;
          currentNum = "0";
        }

        if (currentNum === "")
          currentNum = '0';

        currentNum += '.';
        showNum(evaluator(trimNum(currentNum)) + '.');
      } else if (hasDecimal)
        showNum(evaluator(trimNum(currentNum)) + '.');
      else
        showNum(evaluator(trimNum(currentNum)));

      break;
  
    case 'number':
      $(".clear").text('C');
      if (equalsBtn) {
        equalsBtn = false;
        displayNum = "";
        currentNum = "";
        chainAdd = false;
        lastNum = [];
      }
      if (hasDecimal) currentNum = trimNum(currentNum);
      if (evaluator(trimNum(currentNum) + evaluator(obj.attr("value"))).toString().length <= 9)
        currentNum += obj.attr("value");

      currentNum = currentNum.toString();

      if (hasDecimal)
        showNum(trimNum(currentNum));
      else
        showNum(evaluator(trimNum(currentNum)));

      break;
    case 'equals':

      if (displayNum === "0" && (hasDecimal || !chainAdd))
        displayNum = "";

      var tempD = displayNum;
      if (chainAdd)
        displayNum = evaluator(displayNum + trimNum(currentNum));
      else
        displayNum = evaluator(trimNum(currentNum));

      outer: {
          if (!isSymbol(currentNum.charAt(0)) && !chainAdd)
            currentNum = currentNum;
          else if (typeof $lastOperator === "object") {
            if (isSymbol(tempD.toString().charAt(tempD.length - 1)) && currentNum === "0" || isSymbol(currentNum.toString().charAt(0))) //If user presses: # (operator) =
            {
              currentNum = trimNum(currentNum);
              if (countOperators(displayNum) == 0 && equalsBtn)
                break outer;

              else if (countOperators(displayNum) + countOperators(currentNum) == 1) {
                currentNum = $lastOperator.attr("value") + trimNum(evaluator(lastNum[lastNum.length - 1]));
                displayNum = eval(tempD + evaluator(tempD));
              } else if (($lastOperator.attr("value") === "*" || $lastOperator.attr("value") === "/") && countOperators(currentNum) != 1) //if there's more than 1 op and * or / is tapped
              {

                if (lastNum.length === 1)
                  displayNum = eval(tempD + evaluator(tempD));

                  displayNum = lastNum[lastNum.length - 2] + lastNum[lastNum.length - 1] + evaluator(lastNum[lastNum.length - 1]);

                currentNum = $lastOperator.attr("value") + evaluator(lastNum[lastNum.length - 1]);
              } else if (countOperators(currentNum) != 1) {
                currentNum = $lastOperator.attr("value") + evaluator(tempD);
                displayNum = eval(tempD + evaluator(tempD));
              }
            }
            displayNum = displayNum.toString();
          }
        } 
      for (var i = 0; i < displayNum.length - 1; i++)
        if (isSymbol(displayNum.charAt(i)) && isSymbol(displayNum.charAt(i + 1))) {
          displayNum = displayNum.substring(0, i + 1) + " " + displayNum.substring(i + 1);
          i++; 
        }

      displayNum = eval(displayNum);
      if (displayNum.toString().search(/\./) != -1)
        displayNum = eval(displayNum.toPrecision(8));

      showNum(displayNum);

      if (isSymbol(currentNum.charAt(0)))
        currentNum = currentNum.substring(1);

      if (typeof $lastOperator === "object")
        currentNum = $lastOperator.attr("value") + currentNum.toString();
      else
        currentNum = currentNum.toString();

      currentNum = trimNum(currentNum);
      displayNum = displayNum.toString();
      hasDecimal = false

      clearBtn = false;
      equalsBtn = true;
      break;

    case 'symbol':

      if (equalsBtn)
        currentNum = "";

      if (isSymbol(displayNum.charAt(displayNum.length - 1)) && currentNum === "0" && !equalsBtn) {
        displayNum = displayNum.substring(0, displayNum.length - 1) + obj.attr("value");
        $lastOperator = obj;

        if (obj.attr("value") === '*' || obj.attr("value") === '/')
          showNum(evaluator(lastNum[lastNum.length - 1]));
        else
          showNum(eval(evaluator(displayNum)));
      } else {

        if (!chainAdd) chainAdd = true;
 
        if (displayNum.charAt(0) === "0" && (hasDecimal || displayNum.length !== 1))
          displayNum = displayNum.substring(1, displayNum.length);

        currentNum = trimNum(currentNum);
        if (evaluator(displayNum + currentNum).toString().length <= 9) {
          displayNum += evaluator(currentNum);

          displayNum = trimNum(displayNum);

          if ((obj.attr("value") !== '*' && obj.attr("value") !== '/') || equalsBtn)
            showNum(eval(displayNum));
          else
            showNum(currentNum);

          displayNum += obj.attr("value");
          $lastOperator = obj;
          lastNum.push(currentNum + $lastOperator.attr("value"));
          currentNum = "0";
        }

        equalsBtn = false;
        hasDecimal = false;
        clearBtn = false;
      }
      break;

    case 'darkGray':
      if (obj.is('.clear')) {
        if (!clearBtn && obj.text() === 'C' && !equalsBtn)
          clearBtn = true;

        hasDecimal = false;
        equalsBtn = false;
        currentNum = "0";
        obj.text('AC');

        if (clearBtn) 
        {
          clearBtn = false;
          showNum(evaluator("0"));
          drawOrangeBorders($lastOperator);
        } else 
        {
          chainAdd = false;
          displayNum = "0";
          showNum(evaluator(displayNum + 0));
          clearOrangeBorders($orangeButtons);
          $lastOperator = "";
          lastNum = []
        }
      }

      if (obj.attr("value") === "+/-") {
        if (equalsBtn) 
        {
          displayNum = displayNum * -1;

          if (hasDecimal)
            showNum(eval(displayNum).toPrecision(8));
          else
            showNum(eval(displayNum.toPrecision(9)));

          displayNum = displayNum.toString();
        } 
        else 
        {
          currentNum = currentNum * -1;

          if (hasDecimal)
            showNum(currentNum);
          else
            showNum(eval(currentNum));

          currentNum = currentNum.toString();
        }
      }
     

      if (obj.attr("value") === "%") {
        if (equalsBtn) {
          displayNum = displayNum / 100;

          if (hasDecimal)
            showNum(eval(displayNum).toPrecision(8));
          else
            showNum(eval(displayNum.toPrecision(9)));

          displayNum = displayNum.toString();
        } 
        else
        {
          currentNum = currentNum /100;

          if (hasDecimal)
            showNum(currentNum);
          else
            showNum(eval(currentNum));

          currentNum = currentNum.toString();
        }
      }


      break;
  }
}

var evaluator = function(expression) {
  var val = "";
  if (typeof expression === "number")
    expression = expression.toString();

  if (expression === "")
    val = expression;
  else if (expression.charAt(expression.length - 1) === '.' || isSymbol(expression.charAt(expression.length - 1)))
    val = eval(expression.substring(0, expression.length - 1));
  else
    val = eval(expression);

  return val;
}

var showNum = function(num) {
  if (typeof num === "number")
    num = num.toString();

  $displayTxt.text(num);
}

var trimNum = function(num) {
  if (typeof num === "number")
    num = num.toString();

  if (num.length !== 1 && ((num.charAt(0) === "0" && num.charAt(1) !== '.') || num.charAt(0) == "0"))
    return num.substring(1, num.length);
  else if (isSymbol(num.charAt(0)) && num.charAt(1) === "0")
    return num.charAt(0) + num.substring(2, num.length);
  else
    return num;
}

var countOperators = function(str) {
  str = str.toString();
  str = str.split('');

  return str.filter(function(a) {
    return isSymbol(a);
  }).length;
}

var changeFontSize = function(size) {
  $displayTxt.css("font-size", size);
}

var lengthChecker = function(num) {
  if (typeof num === "number")
    num = num.toString();

  if (num.length == 9)
    changeFontSize(45);
  else if (num.length > 9) {
    changeFontSize(40);
    $displayTxt.text('limit exceeded');
  } else
    changeFontSize(50);
}

var UIUp = function(obj) {
  if (obj.is(".btnO")) {
    clearOrangeBorders($orangeButtons);
    drawOrangeBorders(obj);
    transition(obj, 0);
  } else if (obj.is(".btnG")) {
    clearOrangeBorders($(".btnO"));
    transition(obj, 0);
  } else
    transition(obj, 0);
};

var UIDown = function(obj) {
  if (obj.is(".btnO")) {
    transition(obj, .5);
  } else
    transition(obj, .5);
};

var clearOrangeBorders = function(obj) {
  if (typeof obj === "object")
    obj.css({
      "border-top": ".01cm solid rgb(102, 102, 102)",
      "border-left": ".00cm solid rgb(102, 102, 102)",
      "border-bottom": ".00cm solid rgb(102, 102, 102)"
    });
}

var drawOrangeBorders = function(obj) {
  if (typeof obj === "object")
    obj.not(".btnEquals").css({
      "border-top": "2px solid black",
      "border-left": "2px solid black",
      "border-bottom": "2px solid black"
    });
}

var transition = function(obj, time) {
  if (typeof obj === "object")
    obj.css({
      "-o-transition": time + "s",
      "-ms-transition": time + "s",
      "-moz-transition": time + "s",
      "-webkit-transition": time + "s",
      "transition": time + "s linear"
    });
}