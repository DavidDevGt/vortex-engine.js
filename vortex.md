# Docs VortexJS

¡Bienvenido a VortexJS! Este framework reactivo ligero e intuitivo hace que construir aplicaciones web dinámicas sea más sencillo que nunca. Ya seas nuevo en el desarrollo frontend o estés buscando una alternativa más simple a frameworks más grandes, VortexJS te proporciona las herramientas esenciales que necesitas.

## Tabla de Contenidos

1. Introducción
2. Primeros Pasos
3. Conceptos Fundamentales
4. Directivas
5. Gestión del Estado
6. Ejemplos
7. Buenas Prácticas

## 1. Introducción

VortexJS es un framework JavaScript reactivo que te ayuda a crear aplicaciones web dinámicas con un mínimo de código inicial. Utiliza un sistema basado en directivas simple que te resultará familiar si has trabajado con frameworks como Vue.js, pero con una curva de aprendizaje más suave.

### Características Principales

- Gestión de estado reactiva
- Sistema de directivas simple
- Actualizaciones automáticas del DOM
- No requiere herramientas de construcción
- Ligero y rápido

## 2. Primeros Pasos

### Instalación

Simplemente incluye el script de VortexJS en tu archivo HTML:

```html
<script src="vortex.js"></script>
```

### Configuración Básica

Para crear una aplicación reactiva, necesitas dos cosas:

1. Una zona marcada con el atributo `vx-zone`
2. Una instancia del motor VortexJS

Aquí tienes la aplicación VortexJS más simple posible:

```html
<div vx-zone>
    <h1 vx-bind="mensaje"></h1>
</div>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        Vortex.createEngine({ mensaje: "¡Hola, VortexJS!" }).mount();
    });
</script>
```

## 3. Conceptos Fundamentales

### Zonas

Las zonas son secciones de tu HTML que VortexJS hará reactivas. Marca cualquier contenedor con `vx-zone` para indicarle a VortexJS dónde debe trabajar:

```html
<div vx-zone>
    <!-- VortexJS manejará esta área -->
</div>
```

### Estado

El estado es la información de tu aplicación. Se crea al inicializar el motor:

```javascript
Vortex.createEngine({
    usuario: "Ana",
    puntuacion: 100,
    estaConectado: true
}).mount();
```

## 4. Directivas

VortexJS usa directivas para conectar tu HTML con el estado de la aplicación.

### vx-bind

Muestra valores del estado en tu HTML:

```html
<div vx-zone>
    <p>Bienvenido, <span vx-bind="usuario"></span>!</p>
    <p>Puntuación: <span vx-bind="puntuacion"></span></p>
</div>
```

### vx-show

Alterna la visibilidad de elementos basándose en una condición:

```html
<div vx-zone>
    <p vx-show="estaConectado">¡Bienvenido de nuevo!</p>
    <p vx-show="!estaConectado">Por favor, inicia sesión</p>
</div>
```

### vx-if

Agrega o elimina elementos basándose en una condición:

```html
<div vx-zone>
    <button vx-if="esAdmin">Eliminar Publicación</button>
</div>
```

### vx-for

Repite elementos para cada item en un array:

```html
<div vx-zone>
    <ul>
        <li vx-for="tarea in listaTareas">
            <span vx-bind="tarea.texto"></span>
        </li>
    </ul>
</div>
```

### vx-model

Crea un enlace bidireccional para inputs de formularios:

```html
<div vx-zone>
    <input vx-model="nombreUsuario" type="text">
    <p>Nombre actual: <span vx-bind="nombreUsuario"></span></p>
</div>
```

### vx-on

Maneja eventos de usuario:

```html
<div vx-zone>
    <button vx-on="click: puntuacion += 10">Agregar Puntos</button>
</div>
```

## 5. Gestión del Estado

### Actualizando el Estado

Actualiza el estado de tu aplicación usando el método `setState`:

```javascript
const engine = Vortex.createEngine({ contador: 0 }).mount();

// Más adelante en tu código:
engine.setState({ contador: 5 });
```

### Actualizaciones Reactivas

VortexJS actualiza automáticamente el DOM cuando el estado cambia. Aquí tienes un ejemplo completo de contador:

```html
<div vx-zone>
    <h1>Contador: <span vx-bind="contador"></span></h1>
    <button vx-on="click: contador++">Incrementar</button>
</div>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        Vortex.createEngine({ contador: 0 }).mount();
    });
</script>
```

## 6. Ejemplos

### Lista de Tareas

Aquí tienes una implementación simple de una lista de tareas:

```html
<div vx-zone>
    <input vx-model="nuevaTarea" type="text">
    <button vx-on="click: tareas.push({texto: nuevaTarea, completada: false}); nuevaTarea = ''">
        Agregar Tarea
    </button>
    
    <ul>
        <li vx-for="tarea in tareas">
            <input type="checkbox" 
                   vx-on="change: tarea.completada = !tarea.completada">
            <span vx-bind="tarea.texto"
                  vx-show="!tarea.completada"></span>
            <s vx-bind="tarea.texto"
               vx-show="tarea.completada"></s>
        </li>
    </ul>
</div>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        Vortex.createEngine({
            nuevaTarea: "",
            tareas: []
        }).mount();
    });
</script>
```

### Formulario Dinámico

Aquí tienes un ejemplo de un formulario reactivo:

```html
<div vx-zone>
    <form vx-on="submit: manejarEnvio(event)">
        <input vx-model="formulario.nombre" placeholder="Nombre">
        <input vx-model="formulario.email" placeholder="Email">
        
        <button vx-show="formulario.nombre && formulario.email">
            Enviar
        </button>
    </form>
    
    <div vx-if="enviado">
        ¡Gracias, <span vx-bind="formulario.nombre"></span>!
    </div>
</div>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        Vortex.createEngine({
            formulario: { nombre: "", email: "" },
            enviado: false,
            manejarEnvio(event) {
                event.preventDefault();
                this.enviado = true;
            }
        }).mount();
    });
</script>
```

## 7. Buenas Prácticas

1. **Organización de Zonas**: Mantén las zonas enfocadas y específicas. No las hagas demasiado grandes o demasiado anidadas.

2. **Estructura del Estado**: Mantén tu estado plano y simple cuando sea posible. Los objetos anidados complejos pueden ser más difíciles de manejar.

3. **Manejo de Eventos**: Para manejadores de eventos complejos, defínelos en tu código de inicialización en lugar de en línea.

4. **Rendimiento**: Usa `vx-show` para elementos que se alternan frecuentemente en lugar de `vx-if` cuando sea posible, ya que es más eficiente.

5. **Manejo de Errores**: VortexJS incluye límites de error incorporados. Monitorea tu consola para ver mensajes de error útiles durante el desarrollo.

---

Recuerda, VortexJS está diseñado para ser accesible y directo. Comienza con ejemplos simples y gradualmente construye aplicaciones más complejas a medida que te sientas cómodo con los conceptos básicos.

¡Feliz desarrollo con VortexJS! 🌪️
