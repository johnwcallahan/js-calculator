"use strict";

//==============================================================================
//Expression evaluator module
//==============================================================================
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

            //if it's a number, push it to output
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

    /* Evaluates postfix expression (e.g. "2 3 4 * +") and returns the result */
    function _evalPostfix(expr) {
        var stack = [],
            op1, op2, result;
        var exprArr = expr.split(" ");

        for (var i = 0; i < exprArr.length; i++) {
            var token = exprArr[i];

            //If it's a number, push it to the stack
            if (Number(token)) {
                stack.push(Number(token));

                /* Otherwise, remove the two top-most operands on the stack, perform 
                the corresponding operation and push the result back */
            } else {
                op2 = stack.pop();
                op1 = stack.pop();
                result = _doMath(op1, token, op2);
                stack.push(result);
            }
        }
        return stack.pop();
    }

    /* Helper function - performs simple arithmetic */
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

    var _expr = ""; /* Stores expression being built by user input */
    var _pressedEquals = true;
    /* Keeps track of equals button so _expr can be
                                     reset if needed */

    var getExpr = function() {
        return _expr;
    };

    /* Add digit to expression. If equals button has just been pressed, reset
    expression first. */
    var addDigit = function(digit) {
        if (_pressedEquals)
            _expr = "";
        if (_expr.length >= 24) // MAX length of calculator display
            return;
        _expr += digit;
        _pressedEquals = false;
    };

    /* Add operator to expression as long as expression isn't empty. If the last
    item in expression is an operator, replace that operator with the new one */
    var addOperator = function(operator) {
        if (!_expr)
            return;
        else if (isLastOperator())
            _expr = _expr.slice(0, _expr.length - 3);
        _expr += operator;
        _pressedEquals = false;
    };

    /* If last item of _expr is a number, flip its sign (positive -> negative, 
    negative -> positive) */
    var plusOrMinus = function() {
        if (!_expr || isLastOperator())
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
        if (!_expr || isLastOperator())
            return;
        var exprArr = _expr.split(" ");
        var lastNumber = exprArr.pop();
        exprArr.push(lastNumber / 100);
        _expr = exprArr.join(" ");
    };

    /* Returns true if last item in expression is an operator (operators have
    trailing whitespace.) */
    var isLastOperator = function() {
        return _expr[_expr.length - 1] == " ";
    };

    /* Calculates the value of _expr if it's not empty or if the last item
    isn't an operator. */
    var calculate = function() {
        if (!_expr || isLastOperator())
            return;
        var result = ExprEval.calculate(_expr);
        result = Math.round(result * 10000000) / 10000000;
        if (result > 999999999) {
            result = result.toExponential(5);
        }
        _expr = String(result);
        _pressedEquals = true;
    };

    var clearExpr = function() {
        _expr = "";
    };

    return {
        getExpr: getExpr,
        addDigit: addDigit,
        addOperator: addOperator,
        plusOrMinus: plusOrMinus,
        percentage: percentage,
        calculate: calculate,
        clearExpr: clearExpr,
    };

})();

//==============================================================================
//DOM interaction
//==============================================================================
$(document).ready(function() {

    //Maps HTML IDs to operands and operators
    var opMap = {
        "zero": "0",
        "one": "1",
        "two": "2",
        "three": "3",
        "four": "4",
        "five": "5",
        "six": "6",
        "seven": "7",
        "eight": "8",
        "nine": "9",
        "point": ".",
        "plus": " + ",
        "minus": " - ",
        "multiply": " * ",
        "divide": " / "
    };

    $(".digit").click(function(event) {
        Calculator.addDigit(opMap[event.target.id]);
        renderDisplay();
    });

    $(".operator").click(function(event) {
        Calculator.addOperator(opMap[event.target.id]);
        renderDisplay();
    });

    $("#plusOrMinus").click(function() {
        Calculator.plusOrMinus();
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

    function renderDisplay() {
        $("#display").html(toHTMLEntities(Calculator.getExpr()));
    }

    /* Converts "*", "-", and "/" to HTML entities */
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