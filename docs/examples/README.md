# VortexEngine Examples

This directory contains example applications demonstrating various features of VortexEngine.

## Available Examples

### 1. Counter (`counter.html`)
A simple counter application that demonstrates:
- Basic state management
- Event handling with `vx-on`
- Conditional rendering with `vx-show`
- Data binding with `vx-bind`

**To run:** Open `counter.html` in your browser

### 2. Todo App (`todo.html`)
A fully functional todo application that demonstrates:
- Complex state management
- Array manipulation
- Two-way data binding with `vx-model`
- List rendering with `vx-for`
- Computed properties
- Form handling

**To run:** Open `todo.html` in your browser

## Running Examples

### Option 1: Direct File Opening
Simply open any `.html` file directly in your web browser.

### Option 2: Local Server (Recommended)
For better development experience, serve the files through a local server:

```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js (if you have it installed)
npx http-server

# Using PHP
php -S localhost:8080
```

Then navigate to `http://localhost:8080/examples/` in your browser.

## Creating Your Own Examples

To create a new example:

1. Create a new HTML file in this directory
2. Include the VortexEngine script: `<script src="../../dist/vortex-engine.js"></script>`
3. Add a `vx-zone` to define the reactive area
4. Create your VortexEngine engine and mount it

Example template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My VortexEngine Example</title>
    <script src="../../dist/vortex-engine.js"></script>
</head>
<body>
    <div vx-zone>
        <!-- Your reactive content here -->
    </div>

    <script>
        const app = VortexEngine.createEngine({
            // Your initial state
        });

        // Your functions

        app.mount();
    </script>
</body>
</html>
```
