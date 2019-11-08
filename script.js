"use strict";

//==============================================================================
//Expression evaluator module
//==============================================================================

// test comment

var ExprEval = (function() {

    /* Accepts an infix expression (e.g. "2 + 3 * 4") and returns it in postfix
    notation (e.g. "2 3 4 * +") Does NOT check input or handle parentheses */
    function _toPostfix(expr) {

        var opOrder = { //Order of operations
            "*": 2,
            "/": 2,
            "+": 1,
            "-": 1
        };

        var postfix = [],
            opStack = [],
            token;
        var exprArr = expr.split(" ");

        for (var i = 0; i < exprArr.length; i++) {
            token = exprArr[i];

            //If it's a number, push it to output
            if (Number(token)) {
                postfix.push(token);
            } else {
                /* remove operators with higher precedence from the stack
                and push them to output */
                while (opStack.length > 0 &&
                    opOrder[opStack[opStack.length - 1]] >= opOrder[token]) {
                    postfix.push(opStack.pop());
                }
                opStack.push(token);
            }
        }
        //move any remaining operators to output
        while (opStack.length > 0)
            postfix.push(opStack.pop());
        return postfix.join(" ");
    }

    //Evaluates a postfix expression (e.g. "2 3 4 * +") and returns the result
    function _evalPostfix(expr) {
        var stack = [],
            op1, op2, result;
        var exprArr = expr.split(" ");

        for (var i = 0; i < exprArr.length; i++) {
            var token = exprArr[i];

            //If it's a number, push it to the stack
            if (Number(token)) {
                stack.push(Number(token));
            } else {
                /* Remove the two top-most operands on the stack, perform the 
                corresponding operation and push the result back */
                op2 = stack.pop();
                op1 = stack.pop();
                result = _doMath(op1, token, op2);
                stack.push(result);
            }
        }
        return stack.pop();
    }

    //Helper function - performs simple arithmetic
    function _doMath(operand1, operator, operand2) {
        if (operator === "+")
            return operand1 + operand2;
        else if (operator === "-")
            return operand1 - operand2;
        else if (operator === "*")
            return operand1 * operand2;
        else
            return operand1 / operand2;
    }

    var calculate = function(expr) {
        return _evalPostfix(_toPostfix(expr));
    };

    return {
        calculate: calculate
    };

})();

//==============================================================================
//Calculator interface
//==============================================================================
var Calculator = (function() {

    var _expr = ""; //Stores expression being built by user input
    var _pressedEquals = true; /* Keeps track of equals button so _expr can be
                               reset if needed */

    //Returns true if last item in expression is an operator
    function _isLastOperator() {
        return _expr[_expr.length - 1] == " ";
    }

    //Returns true if value is a number or a decimal
    var _isNumberOrDecimal = function(value) {
        return (Number(value) || value == "0" || value == ".");
    };

    //Returns true if last char and newValue are both decimals
    var _checkRepeatingDecimal = function(newValue) {
        return (_expr[_expr.length - 1] == "." && newValue == ".");
    };

    var getExpr = function() {
        return _expr;
    };

    //Add digit to expression.
    var addDigit = function(digit) {
        if (!_isNumberOrDecimal(digit) ||
            _expr.length >= 24 || //Max display length
            _checkRepeatingDecimal(digit))
            return;
        if (_pressedEquals) //Reset expression if equals was just pressed
            _expr = "";
        _expr += digit;
        _pressedEquals = false;
    };

    //Add operator to expression
    var addOperator = function(operator) {
        if (!_expr)
            return;
        else if (_isLastOperator())
        //If last item in expression is an operator, delete it first
            _expr = _expr.slice(0, _expr.length - 3);
        _expr += operator;
        _pressedEquals = false;
    };

    /* If last item of expression is a number, flip its sign 
    (positive -> negative, negative -> positive) */
    var posNeg = function() {
        if (!_expr || _isLastOperator())
            return;
        var exprArr = _expr.split(" ");
        var lastNumber = exprArr.pop();
        if (lastNumber > 0)
            exprArr.push(-Math.abs(lastNumber));
        else
            exprArr.push(Math.abs(lastNumber));
        _expr = exprArr.join(" ");
    };

    //If last item of _expr is a number, divide it by 100
    var percentage = function() {
        if (!_expr || _isLastOperator())
            return;
        var exprArr = _expr.split(" ");
        var lastNumber = exprArr.pop();
        exprArr.push(lastNumber / 100);
        _expr = exprArr.join(" ");
    };

    /* Calculates the value of expression, rounds it to 8 decimal places, and 
    converts it to scientific notation if >= 1 billion */
    var calculate = function() {
        if (!_expr || _isLastOperator())
            return;
        var result = ExprEval.calculate(_expr);
        result = Math.round(result * 10000000) / 10000000;
        if (result > 999999999) {
            result = result.toExponential(5);
        }
        _expr = String(result);
        _pressedEquals = true;
    };

    //Deletes last item of expression
    var deleteLast = function() {
        if (!_expr)
            return;
        else if (_isLastOperator()) {
            _expr = _expr.slice(0, _expr.length - 3);
        } else {
            _expr = _expr.slice(0, _expr.length - 1);
        }
    };

    var clearExpr = function() {
        _expr = "";
    };

    return {
        getExpr: getExpr,
        addDigit: addDigit,
        addOperator: addOperator,
        posNeg: posNeg,
        percentage: percentage,
        calculate: calculate,
        deleteLast: deleteLast,
        clearExpr: clearExpr,
    };

})();

//==============================================================================
//DOM interaction
//==============================================================================
$(document).ready(function() {

    //Maps HTML IDs to operands and operators
    var opMap = {
        "zero":     "0",
        "one":      "1",
        "two":      "2",
        "three":    "3",
        "four":     "4",
        "five":     "5",
        "six":      "6",
        "seven":    "7",
        "eight":    "8",
        "nine":     "9",
        "point":    ".",
        "plus":     " + ",
        "minus":    " - ",
        "multiply": " * ",
        "divide":   " / "
    };

    $(".digit").click(function(event) {
        Calculator.addDigit(opMap[event.target.id]);
        renderDisplay();
    });

    $(".operator").click(function(event) {
        Calculator.addOperator(opMap[event.target.id]);
        renderDisplay();
    });

    $("#posNeg").click(function() {
        Calculator.posNeg();
        renderDisplay();
    });

    $("#percentage").click(function() {
        Calculator.percentage();
        renderDisplay();
    });

    $("#equals").click(function() {
        Calculator.calculate();
        renderDisplay();
    });

    $("#clear").click(function() {
        Calculator.clearExpr();
        renderDisplay();
    });

    $(document).keydown(function(event) {
        if (event.key == "+" || event.key == "-" ||
            event.key == "*" || event.key == "/") {
            Calculator.addOperator(" " + event.key + " ");
            renderDisplay();
        } else if (event.key == "_") {
            Calculator.posNeg();
            renderDisplay();
        } else if (event.key == "%") {
            Calculator.percentage();
            renderDisplay();
        } else if (event.key == "Enter") {
            Calculator.calculate();
            renderDisplay();
        } else if (event.key == "c") {
            Calculator.clearExpr();
            renderDisplay();
        } else if (event.key == "Backspace") {
            Calculator.deleteLast();
            renderDisplay();
        } else {
            Calculator.addDigit(event.key);
            renderDisplay();
        }
    });

    function renderDisplay() {
        $("#display").html(toHTMLEntities(Calculator.getExpr()));
    }

    //Converts "*", "-", and "/" to HTML entities
    function toHTMLEntities(expr) {
        var output = "";
        for (var i = 0; i < expr.length; i++) {
            if (expr[i] === "-")
                output += "&minus;";
            else if (expr[i] === "*")
                output += "&times;";
            else if (expr[i] === "/")
                output += "&divide;";
            else
                output += expr[i];
        }
        return output;
    }
});
