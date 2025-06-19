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

        // Array de métodos que modifican arrays y deben disparar reactividad
        const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

        return new Proxy(target, {
            get(target, property) {
                if (typeof property === 'symbol') {
                    return target[property];
                }

                const value = target[property];
                const newPath = path ? `${path}.${property}` : property;

                // Interceptar métodos de array para reactividad
                if (Array.isArray(target) && arrayMethods.includes(property)) {
                    return function (...args) {
                        const result = Array.prototype[property].apply(target, args);
                        callback(path); // Notificar cambio en el array completo
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
                /^\d+(\.\d+)?$/.test(expr) || // Number literal (incluye decimales)
                this.isStringConcatenation(expr) ||
                this.isMathExpression(expr) ||
                expr === 'true' || expr === 'false';
        }

        static isStringConcatenation(expression) {
            // Detecta concatenación segura: 'string' + variable + 'string'
            const concatPattern = /^('([^']*)'\s*\+\s*[a-zA-Z_$][a-zA-Z0-9_$.]*(\s*\+\s*'([^']*)')?|[a-zA-Z_$][a-zA-Z0-9_$.]*\s*\+\s*'([^']*)'|\s*'([^']*)'\s*\+\s*[a-zA-Z_$][a-zA-Z0-9_$.]*\s*(\+\s*'([^']*)')?)+$/;
            return concatPattern.test(expression);
        }

        static isMathExpression(expression) {
            // Detecta expresiones matemáticas con paréntesis: (variable * number)
            const mathWithParens = /^\(\s*[a-zA-Z_$][a-zA-Z0-9_$.]*\s*[\+\-\*\/]\s*\d+(\.\d+)?\s*\)$|^[a-zA-Z_$][a-zA-Z0-9_$.]*\s*[\+\-\*\/]\s*\d+(\.\d+)?$/;
            return mathWithParens.test(expression);
        }

        static evaluate(expression, context) {
            const expr = expression.trim();

            // Expresiones simples de path (ej: "user.name")
            if (this.isSimplePath(expr)) {
                return this.getNestedValue(context, expr);
            }

            // String literals
            if (/^'.+'$/.test(expr)) {
                return expr.slice(1, -1);
            }

            // Number literals (incluye decimales)
            if (/^\d+(\.\d+)?$/.test(expr)) {
                return parseFloat(expr);
            }

            // Boolean literals
            if (expr === 'true') return true;
            if (expr === 'false') return false;

            // Concatenación de strings mejorada
            if (this.isStringConcatenation(expr)) {
                return this.evaluateStringConcatenation(expr, context);
            }

            // Expresiones matemáticas con paréntesis
            if (this.isMathExpression(expr)) {
                return this.evaluateMathExpression(expr, context);
            }

            // Comparaciones simples
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

            // Operaciones matemáticas simples
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
            // Maneja concatenación como: 'Hello ' + name + '!'
            const parts = [];
            let current = '';
            let inString = false;
            let i = 0;

            while (i < expression.length) {
                const char = expression[i];

                if (char === "'" && (i === 0 || expression[i - 1] !== '\\')) {
                    if (inString) {
                        // Fin de string
                        parts.push("'" + current + "'");
                        current = '';
                        inString = false;
                    } else {
                        // Inicio de string
                        if (current.trim()) {
                            parts.push(current.trim());
                            current = '';
                        }
                        inString = true;
                    }
                } else if (char === '+' && !inString) {
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
                const placeholder = document.createComment("vx-if placeholder");
                let isInDOM = true; // Track element state

                this.engine.bindings.push({
                    type: 'if',
                    el,
                    evaluate,
                    parent,
                    placeholder,
                    isInDOM,
                    update: (state) => {
                        const shouldShow = evaluate(state);

                        if (shouldShow && !this.isInDOM) {
                            // Show element: replace placeholder with element
                            if (placeholder.parentNode) {
                                parent.replaceChild(el, placeholder);
                            }
                            this.isInDOM = true;
                        } else if (!shouldShow && this.isInDOM) {
                            // Hide element: replace element with placeholder
                            if (el.parentNode) {
                                parent.replaceChild(placeholder, el);
                            }
                            this.isInDOM = false;
                        }
                    }
                });
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

                        // Clear previous elements efficiently
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

                        // Insert new elements after placeholder
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
                // Permite múltiples eventos separados por ";"
                const handlers = expression.split(";").map(s => s.trim()).filter(Boolean);
                handlers.forEach(handler => {
                    const [eventName, code] = handler.split(":").map(s => s.trim());
                    if (eventName && code) {
                        // Parser más seguro para eventos
                        const createEventHandler = (code) => {
                            // Solo permitir calls de funciones simples y assignments básicos
                            if (/^[a-zA-Z_$][a-zA-Z0-9_$]*\(\)$/.test(code)) {
                                // Function call like "toggleShow()"
                                const funcName = code.slice(0, -2);
                                return (state, event) => {
                                    if (typeof state[funcName] === 'function') {
                                        state[funcName].call(state, event);
                                    }
                                };
                            } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*[\+\-][\+\-]$/.test(code)) {
                                // Increment/decrement like "counter++"
                                const [prop, op] = [code.slice(0, -2).trim(), code.slice(-2)];
                                return (state) => {
                                    if (op === '++') state[prop]++;
                                    else if (op === '--') state[prop]--;
                                };
                            } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*.+$/.test(code)) {
                                // Simple assignment like "value = 'something'"
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
            // Para cada directiva, recorremos los elementos con ese atributo
            Object.keys(DIRECTIVES).forEach(key => {
                const attr = DIRECTIVES[key];
                // Evitamos procesar elementos que sean descendientes de un vx-for,
                // excepto el propio elemento que define el vx-for.
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
            // Optimización: solo actualizar si hay dependencias afectadas
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
            this._processUpdates(); // Usar método unificado
            return this;
        }

        /**
         * Actualiza el estado y programa un renderizado optimizado (batching).
         * @param {object} newState - Propiedades a actualizar en el estado.
         */
        setState(newState) {
            Object.assign(this.state, newState);
            // No necesitamos programar render manual ya que el proxy lo hace automáticamente
        }
    }

    const VortexCore = {
        createEngine(initialState = {}) {
            return new VortexEngine(initialState);
        }
    };

    global.Vortex = VortexCore;
})(this);
