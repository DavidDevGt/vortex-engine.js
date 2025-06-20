# VortexJS Documentation

*A lightweight, reactive microframework for building dynamic web applications*

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [API Reference](#api-reference)
5. [Directives](#directives)
6. [Advanced Features](#advanced-features)
7. [Examples](#examples)
8. [Performance & Best Practices](#performance--best-practices)
9. [Migration Guide](#migration-guide)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

VortexJS is a modern, lightweight reactive framework that brings the power of data binding and component reactivity to vanilla JavaScript applications. Built around the Proxy API, it provides seamless two-way data binding, declarative templates, and a secure expression system.

### Key Features

- **Reactive State Management**: Automatic UI updates when data changes
- **Declarative Templates**: HTML-first approach with intuitive directives
- **Secure Expression Parsing**: No `eval()` or `with()` statements for enhanced security
- **Zero Dependencies**: Pure vanilla JavaScript implementation
- **Minimal Bundle Size**: Less than 15KB minified
- **Memory Efficient**: Smart caching and cleanup mechanisms
- **Modern Browser Support**: ES6+ features with Proxy API

---

## Getting Started

### Installation

**Via CDN:**
```html
<script src="https://cdn.jsdelivr.net/npm/vortexjs@latest/dist/vortex.min.js"></script>
```

**Via NPM:**
```bash
npm install vortexjs
```

**Direct Download:**
Download the latest version from our [releases page](https://github.com/DavidDevGt/vortexjs/releases).

### Quick Start

Create your first VortexJS application in three simple steps:

**1. HTML Structure**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My VortexJS App</title>
</head>
<body>
    <div vx-zone>
        <h1 vx-bind="title"></h1>
        <p vx-bind="message"></p>
        <button vx-on="click: increment()">Count: <span vx-bind="count"></span></button>
    </div>
    
    <script src="vortex.js"></script>
</body>
</html>
```

**2. JavaScript Logic**
```javascript
// Create and configure your application
const app = Vortex.createEngine({
    title: "Welcome to VortexJS",
    message: "Building reactive apps made simple",
    count: 0,
    
    increment() {
        this.count++;
    }
});

// Mount the application
app.mount();
```

**3. Done!**
Your reactive application is now running. Click the button to see the count update automatically.

---

## Core Concepts

### Reactive State

VortexJS uses JavaScript Proxy objects to create reactive state. Any change to your state automatically triggers UI updates:

```javascript
const app = Vortex.createEngine({
    user: {
        name: "John Doe",
        email: "john@example.com",
        settings: {
            theme: "dark",
            notifications: true
        }
    }
});

// Any of these changes will trigger UI updates
app.state.user.name = "Jane Doe";
app.state.user.settings.theme = "light";
```

### Zones

Zones define reactive areas in your HTML. Only elements within zones are processed for VortexJS directives:

```html
<!-- This div and its children will be reactive -->
<div vx-zone>
    <h1 vx-bind="title"></h1>
    <input vx-model="searchTerm">
</div>

<!-- This div is not reactive -->
<div>
    <p>Static content here</p>
</div>
```

### Expression System

VortexJS uses a secure expression parser that supports:

- **Property Access**: `user.name`, `product.price`
- **String Concatenation**: `'Hello ' + user.name`
- **Mathematical Operations**: `price * quantity`, `(total + tax)`
- **Comparisons**: `age >= 18`, `status === 'active'`
- **Logical Operations**: `isLoggedIn && isAdmin`
- **Ternary Operators**: `isOnline ? 'Online' : 'Offline'`
- **Negation**: `!isLoading`

---

## API Reference

### Vortex.createEngine(initialState)

Creates a new VortexJS engine instance.

**Parameters:**
- `initialState` (Object): Initial state object for the application

**Returns:**
- `VortexEngine`: A new engine instance

**Example:**
```javascript
const app = Vortex.createEngine({
    todos: [],
    filter: 'all',
    newTodo: ''
});
```

### Engine Methods

#### mount(selector)

Mounts the engine and processes all zones.

**Parameters:**
- `selector` (String, optional): CSS selector for zones. Defaults to `"[vx-zone]"`

**Returns:**
- `VortexEngine`: The engine instance (chainable)

**Example:**
```javascript
app.mount(); // Mount all [vx-zone] elements
app.mount('.my-app'); // Mount specific selector
```

#### setState(newState)

Updates the application state.

**Parameters:**
- `newState` (Object): Object containing state updates

**Example:**
```javascript
app.setState({
    loading: false,
    data: response.data
});
```

#### unmount()

Unmounts the engine and cleans up all bindings.

**Example:**
```javascript
app.unmount(); // Clean up when done
```

---

## Directives

### vx-bind

Binds an expression to the element's text content.

**Syntax:** `vx-bind="expression"`

**Examples:**
```html
<!-- Simple binding -->
<span vx-bind="username"></span>

<!-- Expression binding -->
<span vx-bind="'Hello, ' + user.name"></span>

<!-- Mathematical expression -->
<span vx-bind="(price * quantity * 1.1)"></span>

<!-- Conditional expression -->
<span vx-bind="isOnline ? 'Online' : 'Offline'"></span>
```

### vx-show

Controls element visibility based on expression truthiness.

**Syntax:** `vx-show="expression"`

**Examples:**
```html
<!-- Show when condition is true -->
<div vx-show="isLoggedIn">Welcome back!</div>

<!-- Show based on comparison -->
<div vx-show="items.length > 0">You have items in your cart</div>

<!-- Complex condition -->
<div vx-show="user.role === 'admin' && !isLoading">Admin Panel</div>
```

### vx-if

Conditionally renders element in the DOM.

**Syntax:** `vx-if="expression"`

**Key Differences from vx-show:**
- `vx-if`: Adds/removes elements from DOM
- `vx-show`: Uses CSS display property

**Examples:**
```html
<!-- Conditional rendering -->
<div vx-if="hasError">
    <p>An error occurred: <span vx-bind="errorMessage"></span></p>
</div>

<!-- Conditional form -->
<form vx-if="!isSubmitted">
    <input vx-model="email" type="email" placeholder="Email">
    <button vx-on="click: submitForm()">Submit</button>
</form>
```

### vx-for

Renders a list of elements based on an array.

**Syntax:** `vx-for="item in array"`

**Examples:**
```html
<!-- Basic list -->
<ul>
    <li vx-for="todo in todos">
        <span vx-bind="todo.text"></span>
    </li>
</ul>

<!-- Complex list with nested data -->
<div vx-for="user in users">
    <h3 vx-bind="user.name"></h3>
    <p vx-bind="user.email"></p>
    <span vx-show="user.isActive">Active</span>
</div>
```

**JavaScript:**
```javascript
const app = Vortex.createEngine({
    todos: [
        { id: 1, text: "Learn VortexJS", completed: false },
        { id: 2, text: "Build an app", completed: false }
    ]
});
```

### vx-model

Creates two-way data binding for form inputs.

**Syntax:** `vx-model="propertyName"`

**Supported Elements:**
- `<input type="text">`
- `<input type="email">`
- `<input type="password">`
- `<textarea>`

**Examples:**
```html
<!-- Text input -->
<input vx-model="searchQuery" placeholder="Search...">

<!-- Password input -->
<input vx-model="password" type="password">

<!-- Textarea -->
<textarea vx-model="description" rows="4"></textarea>

<!-- Display bound value -->
<p>You typed: <span vx-bind="searchQuery"></span></p>
```

### vx-on

Attaches event listeners to elements.

**Syntax:** `vx-on="event: action"`

**Supported Actions:**
- Function calls: `functionName()`
- Increment/Decrement: `counter++`, `counter--`
- Assignments: `isVisible = true`

**Examples:**
```html
<!-- Function call -->
<button vx-on="click: handleClick()">Click Me</button>

<!-- Multiple events -->
<input vx-on="focus: onFocus(); blur: onBlur()">

<!-- Increment counter -->
<button vx-on="click: counter++">+</button>

<!-- Assignment -->
<button vx-on="click: showModal = true">Show Modal</button>
```

**JavaScript:**
```javascript
const app = Vortex.createEngine({
    counter: 0,
    showModal: false,
    
    handleClick() {
        console.log('Button clicked!');
    },
    
    onFocus() {
        console.log('Input focused');
    },
    
    onBlur() {
        console.log('Input blurred');
    }
});
```

---

## Advanced Features

### Nested Object Reactivity

VortexJS supports deep reactivity for nested objects and arrays:

```javascript
const app = Vortex.createEngine({
    user: {
        profile: {
            name: "John",
            settings: {
                theme: "dark",
                notifications: true
            }
        }
    }
});

// All these changes trigger updates
app.state.user.profile.name = "Jane";
app.state.user.profile.settings.theme = "light";
```

### Array Methods

VortexJS automatically detects array mutations:

```javascript
const app = Vortex.createEngine({
    items: ['apple', 'banana']
});

// These operations trigger UI updates
app.state.items.push('orange');
app.state.items.pop();
app.state.items.sort();
app.state.items.splice(1, 1, 'grape');
```

### Expression Security

VortexJS implements a secure expression parser that prevents code injection:

```javascript
// ✅ Allowed expressions
"user.name"
"'Hello ' + user.name"
"age >= 18"
"isLoggedIn && isAdmin"
"count > 0 ? 'Items' : 'No items'"

// ❌ Blocked expressions
"eval('malicious code')"
"window.location = 'evil.com'"
"document.cookie"
```

### Performance Optimization

#### Batched Updates
VortexJS batches state changes and updates the UI in the next animation frame:

```javascript
// These changes are batched together
app.state.loading = true;
app.state.data = newData;
app.state.error = null;
app.state.loading = false;
// UI updates once with final state
```

#### Smart Binding Updates
Only bindings affected by state changes are updated:

```javascript
// Only bindings that use 'counter' will update
app.state.counter++;

// Only bindings that use 'user.name' will update
app.state.user.name = "New Name";
```

---

## Examples

### Todo Application

**HTML:**
```html
<div vx-zone class="todo-app">
    <h1>Todo List</h1>
    
    <div class="add-todo">
        <input vx-model="newTodo" 
               placeholder="Add a new todo..."
               vx-on="keyup: handleKeyUp(event)">
        <button vx-on="click: addTodo()">Add</button>
    </div>
    
    <div class="filters">
        <button vx-on="click: setFilter('all')" 
                vx-bind="filter === 'all' ? '• All' : 'All'"></button>
        <button vx-on="click: setFilter('active')" 
                vx-bind="filter === 'active' ? '• Active' : 'Active'"></button>
        <button vx-on="click: setFilter('completed')" 
                vx-bind="filter === 'completed' ? '• Completed' : 'Completed'"></button>
    </div>
    
    <ul class="todo-list">
        <li vx-for="todo in filteredTodos" 
            vx-bind="todo.completed ? 'completed' : ''"
            class="todo-item">
            <input type="checkbox" 
                   vx-on="change: toggleTodo(todo.id)"
                   checked="todo.completed">
            <span vx-bind="todo.text"></span>
            <button vx-on="click: removeTodo(todo.id)">×</button>
        </li>
    </ul>
    
    <div class="stats">
        <span vx-bind="activeTodos + ' items left'"></span>
        <button vx-show="completedTodos > 0" 
                vx-on="click: clearCompleted()">
            Clear completed
        </button>
    </div>
</div>
```

**JavaScript:**
```javascript
const todoApp = Vortex.createEngine({
    todos: [
        { id: 1, text: "Learn VortexJS", completed: false },
        { id: 2, text: "Build a todo app", completed: true },
        { id: 3, text: "Deploy to production", completed: false }
    ],
    newTodo: '',
    filter: 'all',
    nextId: 4,
    
    get filteredTodos() {
        switch (this.filter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    },
    
    get activeTodos() {
        return this.todos.filter(todo => !todo.completed).length;
    },
    
    get completedTodos() {
        return this.todos.filter(todo => todo.completed).length;
    },
    
    addTodo() {
        if (this.newTodo.trim()) {
            this.todos.push({
                id: this.nextId++,
                text: this.newTodo.trim(),
                completed: false
            });
            this.newTodo = '';
        }
    },
    
    removeTodo(id) {
        const index = this.todos.findIndex(todo => todo.id === id);
        if (index > -1) {
            this.todos.splice(index, 1);
        }
    },
    
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
        }
    },
    
    setFilter(filter) {
        this.filter = filter;
    },
    
    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
    },
    
    handleKeyUp(event) {
        if (event.key === 'Enter') {
            this.addTodo();
        }
    }
});

todoApp.mount();
```

### Shopping Cart

**HTML:**
```html
<div vx-zone class="shopping-cart">
    <h2>Shopping Cart</h2>
    
    <div class="products">
        <div vx-for="product in products" class="product">
            <h3 vx-bind="product.name"></h3>
            <p>Price: $<span vx-bind="product.price"></span></p>
            <button vx-on="click: addToCart(product)">Add to Cart</button>
        </div>
    </div>
    
    <div class="cart" vx-show="cart.length > 0">
        <h3>Cart Items</h3>
        <div vx-for="item in cart" class="cart-item">
            <span vx-bind="item.name"></span>
            <span>Qty: <span vx-bind="item.quantity"></span></span>
            <span>$<span vx-bind="item.price * item.quantity"></span></span>
            <button vx-on="click: removeFromCart(item.id)">Remove</button>
        </div>
        
        <div class="total">
            <strong>Total: $<span vx-bind="cartTotal"></span></strong>
        </div>
        
        <button vx-on="click: checkout()" class="checkout-btn">
            Checkout
        </button>
    </div>
    
    <div vx-show="cart.length === 0" class="empty-cart">
        <p>Your cart is empty</p>
    </div>
</div>
```

**JavaScript:**
```javascript
const cartApp = Vortex.createEngine({
    products: [
        { id: 1, name: "Laptop", price: 999.99 },
        { id: 2, name: "Mouse", price: 29.99 },
        { id: 3, name: "Keyboard", price: 79.99 }
    ],
    cart: [],
    
    get cartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0).toFixed(2);
    },
    
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
    },
    
    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index > -1) {
            this.cart.splice(index, 1);
        }
    },
    
    checkout() {
        alert(`Checkout successful! Total: $${this.cartTotal}`);
        this.cart = [];
    }
});

cartApp.mount();
```

---

## Performance & Best Practices

### State Management

**✅ Do:**
```javascript
// Group related state together
const app = Vortex.createEngine({
    user: {
        name: "John",
        email: "john@example.com",
        preferences: {
            theme: "dark"
        }
    }
});

// Use computed properties for derived state
const app = Vortex.createEngine({
    items: [],
    
    get totalItems() {
        return this.items.length;
    },
    
    get totalPrice() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }
});
```

**❌ Don't:**
```javascript
// Don't create separate engines for related data
const userEngine = Vortex.createEngine({ name: "John" });
const settingsEngine = Vortex.createEngine({ theme: "dark" });

// Don't mutate state directly in templates
// Instead of: vx-bind="items.push(newItem)"
// Use: vx-on="click: addItem()"
```

### Template Organization

**✅ Do:**
```html
<!-- Keep templates clean and semantic -->
<div vx-zone class="user-profile">
    <div class="header">
        <h1 vx-bind="user.name"></h1>
        <span vx-show="user.isOnline" class="status">Online</span>
    </div>
    
    <div class="content">
        <!-- Content here -->
    </div>
</div>
```

**❌ Don't:**
```html
<!-- Don't nest too many directives -->
<div vx-zone>
    <div vx-if="showContent">
        <div vx-for="item in items">
            <div vx-if="item.visible">
                <div vx-show="item.expanded">
                    <!-- Too deeply nested -->
                </div>
            </div>
        </div>
    </div>
</div>
```

### Memory Management

**✅ Clean up when done:**
```javascript
// Single page applications
let currentApp = null;

function loadPage(pageData) {
    // Clean up previous app
    if (currentApp) {
        currentApp.unmount();
    }
    
    // Create new app
    currentApp = Vortex.createEngine(pageData);
    currentApp.mount();
}

// When leaving the page
window.addEventListener('beforeunload', () => {
    if (currentApp) {
        currentApp.unmount();
    }
});
```

### Expression Optimization

**✅ Efficient expressions:**
```html
<!-- Simple property access -->
<span vx-bind="user.name"></span>

<!-- Cached computed properties -->
<span vx-bind="totalPrice"></span>
```

**❌ Avoid complex expressions in templates:**
```html
<!-- Don't do heavy computation in templates -->
<span vx-bind="items.filter(i => i.active).map(i => i.price).reduce((a,b) => a+b, 0)"></span>

<!-- Instead, use computed properties -->
<span vx-bind="activeTotalPrice"></span>
```

---

## Migration Guide

### From jQuery

**jQuery Pattern:**
```javascript
// jQuery approach
$('#counter').text(count);
$('#increment').click(function() {
    count++;
    $('#counter').text(count);
});
```

**VortexJS Pattern:**
```javascript
// VortexJS approach
const app = Vortex.createEngine({
    count: 0,
    
    increment() {
        this.count++;
    }
});

app.mount();
```

```html
<div vx-zone>
    <span id="counter" vx-bind="count"></span>
    <button id="increment" vx-on="click: increment()">+</button>
</div>
```

### From React

**React Pattern:**
```jsx
function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <span>{count}</span>
            <button onClick={() => setCount(count + 1)}>+</button>
        </div>
    );
}
```

**VortexJS Pattern:**
```html
<div vx-zone>
    <span vx-bind="count"></span>
    <button vx-on="click: count++">+</button>
</div>
```

```javascript
const app = Vortex.createEngine({
    count: 0
});

app.mount();
```

---

## Troubleshooting

### Common Issues

#### 1. Directive Not Working

**Problem:** Directives are not being processed.

**Solution:** Make sure your elements are inside a `vx-zone`:

```html
<!-- ❌ Won't work -->
<div>
    <span vx-bind="message"></span>
</div>

<!-- ✅ Will work -->
<div vx-zone>
    <span vx-bind="message"></span>
</div>
```

#### 2. Expression Errors

**Problem:** "Expression not allowed for security" error.

**Solution:** Use only supported expression syntax:

```html
<!-- ❌ Not allowed -->
<span vx-bind="eval('some code')"></span>

<!-- ✅ Allowed -->
<span vx-bind="user.name"></span>
<span vx-bind="'Hello ' + user.name"></span>
```

#### 3. vx-for Not Updating

**Problem:** List items not updating when array changes.

**Solution:** Use array methods that VortexJS can detect:

```javascript
// ❌ Won't trigger updates
app.state.items = [...app.state.items, newItem];

// ✅ Will trigger updates
app.state.items.push(newItem);
```

#### 4. State Not Reactive

**Problem:** State changes not triggering UI updates.

**Solution:** Ensure you're modifying the proxied state object:

```javascript
const app = Vortex.createEngine({
    user: { name: "John" }
});

// ❌ Won't work
let user = app.state.user;
user.name = "Jane";

// ✅ Will work
app.state.user.name = "Jane";
```

### Debugging Tips

#### 1. Enable Console Logging

```javascript
// Check if your engine is properly mounted
console.log('Bindings:', app.bindings.length);

// Monitor state changes
const originalSetState = app.setState;
app.setState = function(newState) {
    console.log('State update:', newState);
    return originalSetState.call(this, newState);
};
```

#### 2. Inspect Elements

```javascript
// Check if element has VortexJS bindings
const element = document.querySelector('#my-element');
const binding = app.bindings.find(b => b.el === element);
console.log('Element binding:', binding);
```

#### 3. Validate Expressions

```javascript
// Test expressions manually
const expr = "user.name";
const evaluate = app.directiveManager.compileExpression(expr);
console.log('Expression result:', evaluate(app.state));
```

---

## Browser Support

VortexJS requires modern browsers that support:

- **Proxy API** (IE11+ not supported)
- **ES6 Classes**
- **Template Literals**
- **Arrow Functions**

### Supported Browsers

- Chrome 49+
- Firefox 18+
- Safari 10+
- Edge 12+

### Polyfills

For older browser support, consider using:

- [Proxy Polyfill](https://github.com/GoogleChrome/proxy-polyfill)
- [Babel](https://babeljs.io/) for ES6+ features

---

## Contributing

We welcome contributions to VortexJS! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of Conduct
- Development setup
- Submitting pull requests
- Reporting bugs

### Development Setup

```bash
# Clone the repository
git clone https://github.com/DavidDevGt/vortexjs.git
cd vortexjs

# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build
```

---

## License

VortexJS is released under the [MIT License](LICENSE).

---

## Changelog

### v1.0.0
- Initial release
- Core reactive engine
- All basic directives
- Secure expression parser
- Performance optimizations

---

*Documentation last updated: June 2025*

For more examples and community support, visit our [GitHub repository](https://github.com/DavidDevGt/vortexjs).
