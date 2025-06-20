(function (global) {
    'use strict';

    const DIRECTIVES = Object.freeze({
        'bind': 'vx-bind',
        'show': 'vx-show',
        'if': 'vx-if',
        'for': 'vx-for',
        'model': 'vx-model',
        'on': 'vx-on'
    });
    const compiledExpressions = new Map();

    function createReactiveProxy(target, callback, path = '') {
        const cache = new Map();

        const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

        return new Proxy(target, {
            get(target, property) {
                if (typeof property === 'symbol') {
                    return target[property];
                }

                const value = target[property];
                const newPath = path ? `${path}.${property}` : property;

                if (Array.isArray(target) && arrayMethods.includes(property)) {
                    return function (...args) {
                        const result = Array.prototype[property].apply(target, args);
                        callback(path);
                        return result;
                    };
                }

                if (typeof value === 'object' && value !== null) {
                    if (!cache.has(property)) {
                        cache.set(property, createReactiveProxy(value, callback, newPath));
                    }
                    return cache.get(property);
                }
                return value;
            },
            set(target, property, value) {
                const oldValue = target[property];
                if (oldValue !== value) {
                    target[property] = value;
                    const newPath = path ? `${path}.${property}` : property;
                    callback(newPath);
                }
                return true;
            }
        });
    }

    /**
     * Parser seguro de expresiones simple que evita eval y with
     */
    class SafeExpressionParser {
        static allowedOperators = /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/;
        static allowedComparisons = /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*\s*(===|!==|==|!=|<|>|<=|>=)\s*.+$/;
        static allowedMath = /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*\s*[\+\-\*\/]\s*\d+$/;

        static isSimplePath(expression) {
            return this.allowedOperators.test(expression.trim());
        }

        static isAllowedExpression(expression) {
            const expr = expression.trim();
            return this.isSimplePath(expr) ||
                this.allowedComparisons.test(expr) ||
                this.allowedMath.test(expr) ||
                /^'.+'$/.test(expr) || // String literal
                /^\d+(\.\d+)?$/.test(expr) || // Number literal
                this.isStringConcatenation(expr) ||
                this.isMathExpression(expr) ||
                this.isComplexExpression(expr) || // Añadir soporte para expresiones complejas
                this.isTernaryOperator(expr) || // Soporte para operador ternario
                this.isLogicalExpression(expr) || // Soporte para expresiones lógicas
                this.isNegationExpression(expr) || // Soporte para negación
                expr === 'true' || expr === 'false';
        }

        static isComplexExpression(expression) {
            const complexPattern = /^'[^']*'\s*\+\s*\([^)]+\)$|^[a-zA-Z_$][a-zA-Z0-9_$.]*\s*\+\s*'[^']*'$|^'[^']*'\s*\+\s*[a-zA-Z_$][a-zA-Z0-9_$.]*\s*\+\s*'[^']*'$/;
            return complexPattern.test(expression.trim());
        }

        static isStringConcatenation(expression) {
            const concatPattern = /^('([^']*)'\s*\+\s*[a-zA-Z_$][a-zA-Z0-9_$.]*(\s*\+\s*'([^']*)')?|[a-zA-Z_$][a-zA-Z0-9_$.]*\s*\+\s*'([^']*)'|\s*'([^']*)'\s*\+\s*[a-zA-Z_$][a-zA-Z0-9_$.]*\s*(\+\s*'([^']*)')?)+$/;
            return concatPattern.test(expression);
        }

        static isMathExpression(expression) {
            const mathWithParens = /^\(\s*[a-zA-Z_$][a-zA-Z0-9_$.]*\s*[\+\-\*\/]\s*\d+(\.\d+)?\s*\)$|^[a-zA-Z_$][a-zA-Z0-9_$.]*\s*[\+\-\*\/]\s*\d+(\.\d+)?$/;
            return mathWithParens.test(expression);
        }

        static isTernaryOperator(expression) {
            const ternaryPattern = /^[a-zA-Z_$][a-zA-Z0-9_$.]*\s*\?\s*'[^']*'\s*:\s*'[^']*'$/;
            return ternaryPattern.test(expression.trim());
        }

        static isLogicalExpression(expression) {
            const expr = expression.trim();

            const logicalPattern = /^(.+?)\s*(&&|\|\|)\s*(.+)$/;
            const match = expr.match(logicalPattern);

            if (!match) return false;

            const [, left, operator, right] = match;

            return this.isValidSubExpression(left.trim()) && this.isValidSubExpression(right.trim());
        }

        static isNegationExpression(expression) {
            const negationPattern = /^!\s*[a-zA-Z_$][a-zA-Z0-9_$.]*$/;
            return negationPattern.test(expression.trim());
        }

        static isValidSubExpression(expression) {
            const expr = expression.trim();
            return this.isSimplePath(expr) ||
                this.allowedComparisons.test(expr) ||
                this.isNegationExpression(expr) ||
                /^'.+'$/.test(expr) ||
                /^\d+(\.\d+)?$/.test(expr) ||
                expr === 'true' || expr === 'false';
        }

        static evaluate(expression, context) {
            const expr = expression.trim();

            if (this.isSimplePath(expr)) {
                return this.getNestedValue(context, expr);
            }

            if (/^'.+'$/.test(expr)) {
                return expr.slice(1, -1);
            }

            if (/^\d+(\.\d+)?$/.test(expr)) {
                return parseFloat(expr);
            }

            if (expr === 'true') return true;
            if (expr === 'false') return false;

            if (this.isStringConcatenation(expr) || this.isComplexExpression(expr)) {
                return this.evaluateStringConcatenation(expr, context);
            }

            if (this.isMathExpression(expr)) {
                return this.evaluateMathExpression(expr, context);
            }

            if (this.isTernaryOperator(expr)) {
                return this.evaluateTernaryOperator(expr, context);
            }

            if (this.isLogicalExpression(expr)) {
                return this.evaluateLogicalExpression(expr, context);
            }

            if (this.isNegationExpression(expr)) {
                return this.evaluateNegationExpression(expr, context);
            }

            const compMatch = expr.match(/^(.+?)\s*(===|!==|==|!=|<|>|<=|>=)\s*(.+)$/);
            if (compMatch) {
                const [, left, operator, right] = compMatch;
                const leftVal = this.getNestedValue(context, left.trim());
                const rightVal = this.parseValue(right.trim(), context);

                switch (operator) {
                    case '===': return leftVal === rightVal;
                    case '!==': return leftVal !== rightVal;
                    case '==': return leftVal == rightVal;
                    case '!=': return leftVal != rightVal;
                    case '<': return leftVal < rightVal;
                    case '>': return leftVal > rightVal;
                    case '<=': return leftVal <= rightVal;
                    case '>=': return leftVal >= rightVal;
                }
            }

            const mathMatch = expr.match(/^(.+?)\s*([\+\-\*\/])\s*(\d+(\.\d+)?)$/);
            if (mathMatch) {
                const [, left, operator, right] = mathMatch;
                const leftVal = this.getNestedValue(context, left.trim());
                const rightVal = parseFloat(right);

                switch (operator) {
                    case '+': return leftVal + rightVal;
                    case '-': return leftVal - rightVal;
                    case '*': return leftVal * rightVal;
                    case '/': return leftVal / rightVal;
                }
            }

            console.warn(`[VortexJS] Expresión no soportada: ${expression}`);
            return '';
        }

        static evaluateStringConcatenation(expression, context) {
            const expr = expression.trim();

            const complexMatch = expr.match(/^'([^']*)'\s*\+\s*\(([^)]+)\)$/);
            if (complexMatch) {
                const [, stringPart, mathPart] = complexMatch;
                const mathResult = this.evaluateMathExpression(`(${mathPart})`, context);
                return stringPart + mathResult;
            }

            const parts = [];
            let current = '';
            let inString = false;
            let parenLevel = 0;
            let i = 0;

            while (i < expression.length) {
                const char = expression[i];

                if (char === '(') {
                    parenLevel++;
                    current += char;
                } else if (char === ')') {
                    parenLevel--;
                    current += char;
                } else if (char === "'" && parenLevel === 0 && (i === 0 || expression[i - 1] !== '\\')) {
                    if (inString) {
                        parts.push("'" + current + "'");
                        current = '';
                        inString = false;
                    } else {
                        if (current.trim()) {
                            parts.push(current.trim());
                            current = '';
                        }
                        inString = true;
                    }
                } else if (char === '+' && !inString && parenLevel === 0) {
                    if (current.trim()) {
                        parts.push(current.trim());
                        current = '';
                    }
                } else {
                    current += char;
                }
                i++;
            }

            if (current.trim()) {
                parts.push(current.trim());
            }

            return parts.map(part => {
                const p = part.trim();
                if (/^'.*'$/.test(p)) {
                    return p.slice(1, -1); // Remove quotes
                } else if (/^\(.+\)$/.test(p)) {
                    return this.evaluateMathExpression(p, context);
                }
                return String(this.getNestedValue(context, p) || '');
            }).join('');
        }

        static evaluateMathExpression(expression, context) {
            const expr = expression.trim();

            const parenMatch = expr.match(/^\(\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)\s*\)$/);
            if (parenMatch) {
                const [, variable, operator, number] = parenMatch;
                const varValue = this.getNestedValue(context, variable);
                const numValue = parseFloat(number);

                switch (operator) {
                    case '+': return varValue + numValue;
                    case '-': return varValue - numValue;
                    case '*': return varValue * numValue;
                    case '/': return varValue / numValue;
                    default: return varValue;
                }
            }

            return 0;
        }

        static evaluateTernaryOperator(expression, context) {
            const expr = expression.trim();

            const ternaryMatch = expr.match(/^([a-zA-Z_$][a-zA-Z0-9_$.]*)\s*\?\s*'([^']*)'\s*:\s*'([^']*)'$/);
            if (ternaryMatch) {
                const [, condition, trueValue, falseValue] = ternaryMatch;
                const conditionValue = this.getNestedValue(context, condition);
                return conditionValue ? trueValue : falseValue;
            }

            return '';
        }

        static evaluateLogicalExpression(expression, context) {
            const expr = expression.trim();

            const logicalMatch = expr.match(/^(.+?)\s*(&&|\|\|)\s*(.+)$/);
            if (!logicalMatch) return false;

            const [, left, operator, right] = logicalMatch;

            const leftValue = this.evaluateSubExpression(left.trim(), context);

            if (operator === '&&') {
                return leftValue && this.evaluateSubExpression(right.trim(), context);
            } else if (operator === '||') {
                return leftValue || this.evaluateSubExpression(right.trim(), context);
            }

            return false;
        }

        static evaluateNegationExpression(expression, context) {
            const expr = expression.trim();

            const negationMatch = expr.match(/^!\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)$/);
            if (negationMatch) {
                const [, variable] = negationMatch;
                const value = this.getNestedValue(context, variable);
                return !value;
            }

            return false;
        }

        static evaluateSubExpression(expression, context) {
            const expr = expression.trim();

            if (this.isSimplePath(expr)) {
                return this.getNestedValue(context, expr);
            }

            if (this.allowedComparisons.test(expr)) {
                const compMatch = expr.match(/^(.+?)\s*(===|!==|==|!=|<|>|<=|>=)\s*(.+)$/);
                if (compMatch) {
                    const [, left, operator, right] = compMatch;
                    const leftVal = this.getNestedValue(context, left.trim());
                    const rightVal = this.parseValue(right.trim(), context);

                    switch (operator) {
                        case '===': return leftVal === rightVal;
                        case '!==': return leftVal !== rightVal;
                        case '==': return leftVal == rightVal;
                        case '!=': return leftVal != rightVal;
                        case '<': return leftVal < rightVal;
                        case '>': return leftVal > rightVal;
                        case '<=': return leftVal <= rightVal;
                        case '>=': return leftVal >= rightVal;
                    }
                }
            }

            if (this.isNegationExpression(expr)) {
                return this.evaluateNegationExpression(expr, context);
            }

            if (/^'.+'$/.test(expr)) return expr.slice(1, -1);
            if (/^\d+(\.\d+)?$/.test(expr)) return parseFloat(expr);
            if (expr === 'true') return true;
            if (expr === 'false') return false;

            return false;
        }

        static getNestedValue(obj, path) {
            return path.split('.').reduce((current, key) => {
                return current && current[key] !== undefined ? current[key] : '';
            }, obj);
        }

        static parseValue(value, context) {
            const val = value.trim();
            if (/^'.*'$/.test(val)) return val.slice(1, -1);
            if (/^\d+(\.\d+)?$/.test(val)) return parseFloat(val);
            if (val === 'true') return true;
            if (val === 'false') return false;
            return this.getNestedValue(context, val);
        }
    }


    /**
     * Clase ErrorBoundary para gestionar errores en las directivas.
     */
    class ErrorBoundary {
        constructor() {
            this.errorHandlers = new Set();
        }

        handle(error, directiveType, element) {
            const errorInfo = {
                message: error.message,
                directive: directiveType,
                element: element,
                timestamp: new Date(),
                stack: error.stack
            };

            this.errorHandlers.forEach(handler => handler(errorInfo));
            console.error(`[VortexJS] ${directiveType} error:`, errorInfo);
        }

        onError(handler) {
            this.errorHandlers.add(handler);
            return () => this.errorHandlers.delete(handler);
        }
    }

    /**
     * Clase DirectiveManager:
     * Se encarga de registrar y procesar las directivas (vx-bind, vx-show, vx-if, vx-for, vx-model, vx-on).
     */
    class DirectiveManager {
        constructor(engine) {
            this.engine = engine;
            this.directives = new Map();
            this.templateCache = new WeakMap();
            this.registerDefaultDirectives();
        }

        compileExpression(expression, context = 'state') {
            const cacheKey = `${expression}:${context}`;
            if (!compiledExpressions.has(cacheKey)) {
                // Usar parser seguro en lugar de eval/with
                if (!SafeExpressionParser.isAllowedExpression(expression)) {
                    console.error(`[VortexJS] Expresión no permitida por seguridad: ${expression}`);
                    return () => '';
                }

                compiledExpressions.set(cacheKey, (state) => {
                    try {
                        return SafeExpressionParser.evaluate(expression, state);
                    } catch (error) {
                        console.error(`[VortexJS] Error evaluando expresión: ${expression}`, error);
                        return '';
                    }
                });
            }
            return compiledExpressions.get(cacheKey);
        }

        registerDefaultDirectives() {
            // vx-bind: Enlaza una expresión al contenido textual del elemento.
            this.register('bind', (el, expression) => {
                const evaluate = this.compileExpression(expression);
                let lastValue;
                this.engine.bindings.push({
                    type: 'bind',
                    el,
                    evaluate,
                    update: (state) => {
                        const newValue = evaluate(state);
                        if (newValue !== lastValue) {
                            lastValue = newValue;
                            el.textContent = newValue;
                        }
                    }
                });
            });

            // vx-show: Controla la visibilidad del elemento.
            this.register('show', (el, expression) => {
                const evaluate = this.compileExpression(expression);
                this.engine.bindings.push({
                    type: 'show',
                    el,
                    evaluate,
                    update: (state) => {
                        const visible = evaluate(state);
                        el.style.display = visible ? '' : 'none';
                    }
                });
            });

            // vx-if: Inserta o remueve el elemento del DOM según la condición.
            this.register('if', (el, expression) => {
                const evaluate = this.compileExpression(expression);
                const parent = el.parentNode;

                if (!parent) {
                    console.error('[VortexJS] vx-if: Elemento no tiene parent node');
                    return;
                }

                const placeholder = document.createComment(`vx-if: ${expression}`);

                parent.insertBefore(placeholder, el);

                const initialState = this.engine.state;
                const initialShow = evaluate(initialState);

                const binding = {
                    type: 'if',
                    el,
                    evaluate,
                    parent,
                    placeholder,
                    isInDOM: true, // review 
                    update: (state) => {
                        const shouldShow = evaluate(state);

                        if (shouldShow && !binding.isInDOM) {
                            if (placeholder.parentNode === parent) {
                                parent.insertBefore(el, placeholder.nextSibling);
                                binding.isInDOM = true;
                            }
                        } else if (!shouldShow && binding.isInDOM) {
                            if (el.parentNode === parent) {
                                parent.removeChild(el);
                                binding.isInDOM = false;
                            }
                        }
                    },
                    cleanup: () => {
                        if (placeholder.parentNode) {
                            placeholder.remove();
                        }
                        if (el.parentNode) {
                            el.remove();
                        }
                    }
                };

                if (!initialShow) {
                    parent.removeChild(el);
                    binding.isInDOM = false;
                }

                this.engine.bindings.push(binding);
            });

            // vx-for: Itera sobre un array para generar elementos dinámicamente.
            this.register('for', (el, expression) => {
                const match = expression.match(/^\s*(\w+)\s+in\s+(\w+)\s*$/);
                if (!match) {
                    console.error(`VortexJS: vx-for tiene un formato incorrecto: "${expression}"`);
                    return;
                }
                const [_, itemName, listName] = match;
                const template = this.templateCache.get(el) || el.cloneNode(true);
                this.templateCache.set(el, template);
                const parent = el.parentNode;
                const placeholder = document.createComment(`vx-for ${itemName} in ${listName}`);
                parent.replaceChild(placeholder, el);

                let previousElements = [];
                this.engine.bindings.push({
                    type: 'for',
                    listName,
                    itemName,
                    parent,
                    template,
                    placeholder,
                    update: (state) => {
                        const list = state[listName];
                        if (!Array.isArray(list)) return;

                        previousElements.forEach(el => {
                            if (el.parentNode) {
                                el.remove();
                            }
                        });

                        const fragment = document.createDocumentFragment();
                        const newElements = [];

                        list.forEach((item, index) => {
                            const element = template.cloneNode(true);
                            this.processElement(element, item, state, itemName);
                            newElements.push(element);
                            fragment.appendChild(element);
                        });

                        parent.insertBefore(fragment, placeholder.nextSibling);
                        previousElements = newElements;
                    }
                });
            });

            // vx-model: Enlace bidireccional para inputs.
            this.register('model', (el, expression) => {
                const modelName = expression.trim();
                const evaluate = this.compileExpression(modelName);

                const updateInput = (state) => {
                    const newValue = evaluate(state);
                    if (el.value !== newValue) {
                        el.value = newValue;
                    }
                };

                this.engine.bindings.push({
                    type: 'model',
                    el,
                    modelName,
                    evaluate,
                    update: updateInput
                });

                el.addEventListener("input", (e) => {
                    this.engine.setState({ [modelName]: e.target.value });
                });
            });


            // vx-on: Asocia manejadores de eventos al elemento.
            this.register('on', (el, expression) => {
                const handlers = expression.split(";").map(s => s.trim()).filter(Boolean);
                handlers.forEach(handler => {
                    const [eventName, code] = handler.split(":").map(s => s.trim());
                    if (eventName && code) {
                        const createEventHandler = (code) => {
                            if (/^[a-zA-Z_$][a-zA-Z0-9_$]*\(\)$/.test(code)) {
                                const funcName = code.slice(0, -2);
                                return (state, event) => {
                                    if (typeof state[funcName] === 'function') {
                                        state[funcName].call(state, event);
                                    }
                                };
                            } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*[\+\-][\+\-]$/.test(code)) {
                                const [prop, op] = [code.slice(0, -2).trim(), code.slice(-2)];
                                return (state) => {
                                    if (op === '++') state[prop]++;
                                    else if (op === '--') state[prop]--;
                                };
                            } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*.+$/.test(code)) {
                                const [prop, value] = code.split('=').map(s => s.trim());
                                return (state) => {
                                    state[prop] = SafeExpressionParser.parseValue(value, state);
                                };
                            } else {
                                console.warn(`[VortexJS] Evento no soportado por seguridad: ${code}`);
                                return () => { };
                            }
                        };

                        try {
                            const handler = createEventHandler(code);
                            el.addEventListener(eventName, event => {
                                handler(this.engine.state, event);
                            });
                        } catch (error) {
                            console.error(`[VortexJS] Error creando handler para evento "${eventName}": "${code}"`, error);
                        }
                    }
                });
            });

        }

        register(name, handler) {
            this.directives.set(name, handler);
        }

        processZone(zone) {
            Object.keys(DIRECTIVES).forEach(key => {
                const attr = DIRECTIVES[key];

                zone.querySelectorAll(`[${attr}]`).forEach(el => {
                    if (el !== zone && el.closest('[vx-for]') && !el.hasAttribute('vx-for')) {
                        return;
                    }
                    const expression = el.getAttribute(attr);
                    const handler = this.directives.get(key);
                    if (handler) {
                        handler(el, expression);
                    }
                });
            });
        }

        setupDirectives(zone) {
            if (zone) {
                this.processZone(zone);
            } else {
                document.querySelectorAll("[vx-zone]").forEach(zoneEl => this.processZone(zoneEl));
            }
        }

        processElement(element, item, state, itemName) {
            const bindElements = element.querySelectorAll("[vx-bind]");
            bindElements.forEach(el => {
                const expr = el.getAttribute("vx-bind");
                const evaluate = this.compileExpression(expr);
                const combinedState = Object.assign({}, state, { [itemName]: item });
                el.textContent = evaluate(combinedState);
            });
        }

        updateElement(element, item, state, itemName) {
            const bindElements = element.querySelectorAll("[vx-bind]");
            bindElements.forEach(el => {
                const expr = el.getAttribute("vx-bind");
                const evaluate = this.compileExpression(expr);
                const combinedState = Object.assign({}, state, { [itemName]: item });
                const newValue = evaluate(combinedState);
                if (el.textContent !== newValue.toString()) {
                    el.textContent = newValue;
                }
            });
        }
    }

    /**
     * Clase VortexEngine: núcleo reactivo de VortexJS.
     * Gestiona el estado, actualizaciones y renderización de las directivas.
     */
    class VortexEngine {
        constructor(initialState = {}) {
            this.state = createReactiveProxy(initialState, (path) => this._scheduleUpdate(path));
            this.bindings = [];
            this.pendingUpdates = new Set();
            this.updateScheduled = false;
            this.errorBoundary = new ErrorBoundary();
            this.directiveManager = new DirectiveManager(this);
        }

        _scheduleUpdate(path) {
            this.pendingUpdates.add(path);
            if (!this.updateScheduled) {
                this.updateScheduled = true;
                requestAnimationFrame(() => {
                    this._processUpdates();
                });
            }
        }

        _processUpdates() {
            const affectedPaths = Array.from(this.pendingUpdates);
            this.pendingUpdates.clear();
            this.updateScheduled = false;

            this.bindings.forEach(binding => {
                if (this._shouldUpdateBinding(binding, affectedPaths)) {
                    try {
                        if (binding.update) {
                            binding.update(this.state);
                        } else {
                            this._updateBinding(binding);
                        }
                    } catch (error) {
                        this.errorBoundary.handle(error, binding.type, binding.el);
                    }
                }
            });
        }

        _shouldUpdateBinding(binding, affectedPaths) {
            if (!binding.dependencies) return true;

            return affectedPaths.some(path =>
                binding.dependencies.some(dep =>
                    path.startsWith(dep) || dep.startsWith(path)
                )
            );
        }

        // Eliminar _render() ya que es redundante con _processUpdates()

        _updateBinding(binding) {
            if (binding.evaluate) {
                const newValue = binding.evaluate(this.state);
                binding.el.textContent = newValue;
            }
        }

        /**
         * Monta el engine procesando todas las zonas definidas con vx-zone.
         * @param {string} [selector="[vx-zone]"] - Selector para las zonas reactivas.
         * @returns {VortexEngine} Instancia del engine.
         */
        mount(selector = "[vx-zone]") {
            const zones = document.querySelectorAll(selector);
            zones.forEach(zone => {
                this.directiveManager.processZone(zone);
            });

            this._processUpdates();
            return this;
        }

        /**
         * Desmonta el engine y limpia todos los bindings
         */
        unmount() {
            this.bindings.forEach(binding => {
                if (binding.cleanup && typeof binding.cleanup === 'function') {
                    try {
                        binding.cleanup();
                    } catch (error) {
                        console.warn('[VortexJS] Error durante cleanup:', error);
                    }
                }
            });
            this.bindings.length = 0;
            this.pendingUpdates.clear();
            this.updateScheduled = false;
        }

        /**
         * Actualiza el estado y programa un renderizado optimizado (batching).
         * @param {object} newState - Propiedades a actualizar en el estado.
         */
        setState(newState) {
            Object.assign(this.state, newState);
        }
    }

    const VortexCore = {
        createEngine(initialState = {}) {
            return new VortexEngine(initialState);
        }
    };

    global.Vortex = VortexCore;
})(this);
