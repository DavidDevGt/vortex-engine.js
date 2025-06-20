# Documentación de VortexEngine

*Un microframework reactivo y liviano para construir aplicaciones web dinámicas*

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Comenzando](#comenzando)
3. [Conceptos Básicos](#conceptos-básicos)
4. [Referencia de la API](#referencia-de-la-api)
5. [Directivas](#directivas)
6. [Características Avanzadas](#características-avanzadas)
7. [Ejemplos](#ejemplos)
8. [Rendimiento y Mejores Prácticas](#rendimiento-y-mejores-prácticas)
9. [Guía de Migración](#guía-de-migración)
10. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

**VortexEngine** es un microframework reactivo diseñado para crear aplicaciones web dinámicas e interactivas con una sintaxis simple y elegante. Con solo **~2KB** cuando está comprimido, VortexEngine proporciona todas las características esenciales que necesitas para crear interfaces de usuario modernas sin la sobrecarga de frameworks más grandes.

### ¿Por qué VortexEngine?

- 🚀 **Ultraliviano**: Solo ~2KB comprimido
- ⚡ **Reactivo**: Actualizaciones automáticas del DOM cuando cambia el estado
- 📱 **Moderno**: Compatible con ES6+ y navegadores modernos
- 🎯 **Simple**: Sintaxis intuitiva y fácil de aprender
- 🔧 **Flexible**: Se integra fácilmente con proyectos existentes
- 📦 **Sin dependencias**: Completamente independiente

### Inicio Rápido

```html
<!DOCTYPE html>
<html>
<head>
    <script src="vortex-engine.js"></script>
</head>
<body vx-zone>
    <div>
        <h1 vx-bind="title">Título por defecto</h1>
        <p vx-bind="message">Mensaje por defecto</p>
        <button vx-on:click="updateContent()">Actualizar</button>
    </div>

    <script>
        const app = VortexEngine.createEngine({
            title: '¡Hola VortexEngine!',
            message: 'Este es tu primer ejemplo con VortexEngine'
        });

        function updateContent() {
            app.setState({
                title: '¡Contenido Actualizado!',
                message: 'El estado ha cambiado reactivamente'
            });
        }

        app.mount();
    </script>
</body>
</html>
```

---

## Comenzando

### Instalación

VortexEngine se puede usar de varias maneras:

#### 1. CDN (Recomendado para desarrollo rápido)

```html
<script src="https://cdn.jsdelivr.net/npm/vortexjs@latest/vortex-engine.js"></script>
```

#### 2. Descarga Directa

Descarga `vortex-engine.js` y inclúyelo en tu proyecto:

```html
<script src="path/to/vortex-engine.js"></script>
```

#### 3. NPM (Para proyectos Node.js)

```bash
npm install vortexjs
```

Luego impórtalo:

```javascript
import Vortex from 'vortexjs';
```

### Configuración Básica

Para comenzar con VortexEngine, necesitas:

1. **Incluir el script** en tu HTML
2. **Definir una zona** con `vx-zone`
3. **Crear una instancia del motor** con estado inicial
4. **Montar la aplicación**

```html
<!DOCTYPE html>
<html>
<head>
    <script src="vortex-engine.js"></script>
</head>
<body vx-zone>
    <!-- Tu contenido aquí -->
    <script>
        const app = VortexEngine.createEngine({
            // estado inicial
        });
        app.mount();
    </script>
</body>
</html>
```

---

## Conceptos Básicos

### Motor de Estado Reactivo

VortexEngine utiliza un motor de estado reactivo que actualiza automáticamente el DOM cuando cambia el estado:

```javascript
const app = VortexEngine.createEngine({
    count: 0,
    name: 'Usuario',
    isVisible: true
});

// Actualizar el estado
app.setState({
    count: app.state.count + 1
});

// Múltiples actualizaciones
app.setState({
    count: 5,
    name: 'Nuevo Usuario'
});
```

### Zonas y Alcance

Las **zonas** definen el alcance donde VortexEngine puede operar. Usa `vx-zone` para marcar las áreas controladas por VortexEngine:

```html
<!-- Zona global -->
<body vx-zone>
    <h1 vx-bind="title"></h1>
</body>

<!-- Zona específica -->
<div vx-zone>
    <p vx-bind="message"></p>
</div>
```

### Vinculación de Datos

Usa `vx-bind` para vincular propiedades del estado a elementos:

```html
<h1 vx-bind="title">Título por defecto</h1>
<p vx-bind="'Hola ' + userName">Hola Invitado</p>
<span vx-bind="count * 2">0</span>
```

---

## Referencia de la API

### VortexEngine.createEngine(initialState)

Crea una nueva instancia del motor VortexEngine.

**Parámetros:**
- `initialState` (Object): El estado inicial de la aplicación

**Retorna:** Instancia del motor VortexEngine

```javascript
const app = VortexEngine.createEngine({
    counter: 0,
    users: [],
    settings: {
        theme: 'dark',
        language: 'es'
    }
});
```

### engine.setState(newState)

Actualiza el estado de la aplicación y dispara re-renderizado.

**Parámetros:**
- `newState` (Object): Objeto con las propiedades del estado a actualizar

```javascript
app.setState({
    counter: 10,
    'settings.theme': 'light' // Notación de punto para objetos anidados
});
```

### engine.state

Propiedad de solo lectura que contiene el estado actual.

```javascript
console.log(app.state.counter); // Acceso de lectura
// app.state.counter = 5; // ¡NO hagas esto! Usa setState()
```

### engine.mount()

Monta la aplicación y activa la reactividad.

```javascript
app.mount();
```

### engine.unmount()

Desmonta la aplicación y limpia los event listeners.

```javascript
app.unmount();
```

### engine.addEffect(callback)

Añade un efecto que se ejecuta cuando cambia el estado.

**Parámetros:**
- `callback` (Function): Función a ejecutar en cada cambio de estado

```javascript
app.addEffect(() => {
    console.log('El estado cambió:', app.state);
});
```

---

## Directivas

### vx-zone

Define el alcance donde VortexEngine puede operar.

```html
<div vx-zone>
    <!-- Solo el contenido dentro de esta zona será reactivo -->
    <p vx-bind="message"></p>
</div>
```

### vx-bind

Vincula una expresión al contenido del elemento.

```html
<h1 vx-bind="title">Título por defecto</h1>
<p vx-bind="'Usuario: ' + username">Usuario: Anónimo</p>
<span vx-bind="count > 10 ? 'Alto' : 'Bajo'">Bajo</span>
```

### vx-show

Muestra u oculta el elemento basado en una condición.

```html
<div vx-show="isLoggedIn">
    <p>¡Bienvenido de vuelta!</p>
</div>

<div vx-show="items.length > 0">
    <p>Tienes elementos en tu lista</p>
</div>
```

### vx-on:event

Adjunta event listeners a elementos.

```html
<button vx-on:click="increment()">Incrementar</button>
<input vx-on:input="updateName(event.target.value)" />
<form vx-on:submit="handleSubmit(event)">
    <!-- contenido del formulario -->
</form>
```

### vx-model

Vinculación bidireccional para elementos de formulario.

```html
<input vx-model="username" placeholder="Ingresa tu nombre" />
<textarea vx-model="message"></textarea>
<select vx-model="selectedOption">
    <option value="a">Opción A</option>
    <option value="b">Opción B</option>
</select>
```

### vx-for

Itera sobre arrays u objetos.

```html
<!-- Arrays -->
<ul>
    <li vx-for="user in users" vx-bind="user.name">
        Nombre de usuario
    </li>
</ul>

<!-- Arrays con índice -->
<ul>
    <li vx-for="(user, index) in users" vx-bind="index + ': ' + user.name">
        Entrada de usuario
    </li>
</ul>

<!-- Objetos -->
<div>
    <p vx-for="(value, key) in settings" vx-bind="key + ': ' + value">
        Configuración
    </p>
</div>
```

### vx-if

Renderizado condicional.

```html
<div vx-if="user.isAdmin">
    <p>Panel de administrador</p>
</div>

<div vx-if="score >= 80">
    <p>¡Excelente puntuación!</p>
</div>
```

---

## Características Avanzadas

### Estado Anidado

VortexEngine soporta objetos de estado profundamente anidados:

```javascript
const app = VortexEngine.createEngine({
    user: {
        profile: {
            name: 'Juan',
            settings: {
                theme: 'dark',
                notifications: true
            }
        }
    }
});

// Actualizar propiedades anidadas
app.setState({
    'user.profile.name': 'María',
    'user.profile.settings.theme': 'light'
});
```

### Efectos y Watchers

Ejecuta código cuando cambia el estado:

```javascript
// Efecto simple
app.addEffect(() => {
    document.title = `Contador: ${app.state.count}`;
});

// Efecto condicional
app.addEffect(() => {
    if (app.state.user.isLoggedIn) {
        console.log('Usuario inició sesión');
    }
});
```

### Múltiples Instancias

Puedes tener múltiples instancias de VortexEngine en la misma página:

```html
<div vx-zone data-vx-engine="app1">
    <p vx-bind="message">Mensaje de la App 1</p>
</div>

<div vx-zone data-vx-engine="app2">
    <p vx-bind="message">Mensaje de la App 2</p>
</div>

<script>
    const app1 = VortexEngine.createEngine({ message: 'Hola desde App 1' });
    const app2 = VortexEngine.createEngine({ message: 'Hola desde App 2' });
    
    app1.mount('app1');
    app2.mount('app2');
</script>
```

---

## Ejemplos

### Ejemplo 1: Contador Simple

```html
<!DOCTYPE html>
<html>
<head>
    <script src="vortex-engine.js"></script>
</head>
<body vx-zone>
    <h1>Contador: <span vx-bind="count">0</span></h1>
    <button vx-on:click="increment()">+</button>
    <button vx-on:click="decrement()">-</button>
    <button vx-on:click="reset()">Reset</button>

    <script>
        const app = VortexEngine.createEngine({
            count: 0
        });

        function increment() {
            app.setState({ count: app.state.count + 1 });
        }

        function decrement() {
            app.setState({ count: app.state.count - 1 });
        }

        function reset() {
            app.setState({ count: 0 });
        }

        app.mount();
    </script>
</body>
</html>
```

### Ejemplo 2: Lista de Tareas

```html
<!DOCTYPE html>
<html>
<head>
    <script src="vortex-engine.js"></script>
    <style>
        .completed { text-decoration: line-through; opacity: 0.6; }
        .todo-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
    </style>
</head>
<body vx-zone>
    <h1>Lista de Tareas</h1>
    
    <div>
        <input vx-model="newTodo" placeholder="Agregar nueva tarea" />
        <button vx-on:click="addTodo()">Agregar</button>
    </div>

    <div vx-for="(todo, index) in todos" class="todo-item">
        <span vx-bind="todo.text" 
              vx-class="{ completed: todo.completed }">
        </span>
        <button vx-on:click="toggleTodo(index)">
            <span vx-bind="todo.completed ? 'Deshacer' : 'Completar'"></span>
        </button>
        <button vx-on:click="removeTodo(index)">Eliminar</button>
    </div>

    <p>Total: <span vx-bind="todos.length">0</span> | 
       Completadas: <span vx-bind="completedCount">0</span></p>

    <script>
        const app = VortexEngine.createEngine({
            newTodo: '',
            todos: [],
            get completedCount() {
                return this.todos.filter(todo => todo.completed).length;
            }
        });

        function addTodo() {
            if (app.state.newTodo.trim()) {
                const newTodos = [...app.state.todos, {
                    text: app.state.newTodo,
                    completed: false
                }];
                app.setState({ 
                    todos: newTodos,
                    newTodo: ''
                });
            }
        }

        function toggleTodo(index) {
            const newTodos = [...app.state.todos];
            newTodos[index].completed = !newTodos[index].completed;
            app.setState({ todos: newTodos });
        }

        function removeTodo(index) {
            const newTodos = app.state.todos.filter((_, i) => i !== index);
            app.setState({ todos: newTodos });
        }

        app.mount();
    </script>
</body>
</html>
```

---

## Rendimiento y Mejores Prácticas

### Optimización de Rendimiento

1. **Evita Mutaciones Directas del Estado**
   ```javascript
   // ❌ Incorrecto
   app.state.items.push(newItem);
   
   // ✅ Correcto
   app.setState({ items: [...app.state.items, newItem] });
   ```

2. **Usa Expresiones Simples en las Directivas**
   ```html
   <!-- ❌ Evita lógica compleja -->
   <div vx-bind="items.filter(i => i.active).map(i => i.name).join(', ')"></div>
   
   <!-- ✅ Usa propiedades computadas -->
   <div vx-bind="activeItemNames"></div>
   ```

3. **Agrupa Actualizaciones de Estado**
   ```javascript
   // ❌ Múltiples actualizaciones
   app.setState({ name: 'Juan' });
   app.setState({ age: 25 });
   app.setState({ city: 'Madrid' });
   
   // ✅ Una sola actualización
   app.setState({ 
       name: 'Juan', 
       age: 25, 
       city: 'Madrid' 
   });
   ```

### Mejores Prácticas

1. **Organiza tu Estado**
   ```javascript
   const app = VortexEngine.createEngine({
       // Datos de la UI
       ui: {
           isLoading: false,
           currentPage: 1,
           showModal: false
       },
       // Datos de la aplicación
       data: {
           users: [],
           posts: []
       },
       // Configuración
       config: {
           theme: 'light',
           language: 'es'
       }
   });
   ```

2. **Usa Funciones para Lógica Compleja**
   ```javascript
   function updateUser(userId, updates) {
       const users = app.state.data.users.map(user => 
           user.id === userId ? { ...user, ...updates } : user
       );
       app.setState({ 'data.users': users });
   }
   ```

3. **Maneja Errores de Forma Elegante**
   ```javascript
   async function loadData() {
       app.setState({ 'ui.isLoading': true });
       try {
           const data = await fetch('/api/data').then(r => r.json());
           app.setState({ 
               'data.items': data,
               'ui.isLoading': false 
           });
       } catch (error) {
           app.setState({ 
               'ui.isLoading': false,
               'ui.error': error.message 
           });
       }
   }
   ```

---

## Guía de Migración

### Desde jQuery

```javascript
// jQuery
$('#counter').text(count);
$('#button').on('click', function() {
    count++;
    $('#counter').text(count);
});

// VortexEngine
<span id="counter" vx-bind="count">0</span>
<button vx-on:click="increment()">Incrementar</button>

const app = VortexEngine.createEngine({ count: 0 });
function increment() {
    app.setState({ count: app.state.count + 1 });
}
```

### Desde React (Conceptualmente Similar)

```javascript
// React
const [count, setCount] = useState(0);
return <span>{count}</span>;

// VortexEngine
<span vx-bind="count">0</span>
const app = VortexEngine.createEngine({ count: 0 });
// Usa app.setState({ count: newValue })
```

---

## Solución de Problemas

### Problemas Comunes

**1. Las Directivas No Funcionan**
- Asegúrate de que el elemento esté dentro de una zona `vx-zone`
- Verifica que `app.mount()` haya sido llamado
- Revisa la consola del navegador por errores

**2. El Estado No Se Actualiza**
- Usa siempre `setState()` para actualizar el estado
- No mutes directamente `app.state`

**3. Los Event Listeners No Funcionan**
- Asegúrate de que las funciones estén definidas globalmente
- Verifica la sintaxis de `vx-on:event`

**4. Las Expresiones No Se Evalúan**
- Las expresiones se evalúan en el contexto global
- Usa `app.state.propertyName` para acceder al estado en las expresiones

### Depuración

```javascript
// Activa el modo de depuración
Vortex.debug = true;

// Inspecciona el estado actual
console.log(app.state);

// Rastrear cambios de estado
app.addEffect(() => {
    console.log('Estado actualizado:', app.state);
});
```

---

## API Completa

### Constructor
- `VortexEngine.createEngine(initialState)` - Crea una nueva instancia

### Métodos de Instancia
- `engine.setState(updates)` - Actualiza el estado
- `engine.mount(engineName?)` - Monta la aplicación
- `engine.unmount()` - Desmonta la aplicación
- `engine.addEffect(callback)` - Añade un efecto

### Propiedades
- `engine.state` - Estado actual (solo lectura)

### Directivas
- `vx-zone` - Define el alcance de VortexEngine
- `vx-bind` - Vincula expresiones al contenido
- `vx-show` - Visibilidad condicional
- `vx-if` - Renderizado condicional
- `vx-for` - Iteración sobre arrays/objetos
- `vx-on:event` - Event listeners
- `vx-model` - Vinculación bidireccional
- `vx-class` - Clases CSS condicionales

---

¡Disfruta construyendo aplicaciones increíbles con VortexEngine! 🌪️
