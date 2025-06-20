# Documentation VortexEngine

*Un microframework réactif et léger pour créer des applications web dynamiques*

---

## Table des Matières

1. [Introduction](#introduction)
2. [Commencer](#commencer)
3. [Concepts de Base](#concepts-de-base)
4. [Référence de l'API](#référence-de-lapi)
5. [Directives](#directives)
6. [Fonctionnalités Avancées](#fonctionnalités-avancées)
7. [Exemples](#exemples)
8. [Performance et Bonnes Pratiques](#performance-et-bonnes-pratiques)
9. [Guide de Migration](#guide-de-migration)
10. [Dépannage](#dépannage)

---

## Introduction

**VortexEngine** est un microframework réactif conçu pour créer des applications web dynamiques et interactives avec une syntaxe simple et élégante. Avec seulement **13.1KB** en version minifiée, VortexEngine fournit toutes les fonctionnalités essentielles dont vous avez besoin pour créer des interfaces utilisateur modernes sans la surcharge de frameworks plus lourds.

### Pourquoi VortexEngine ?

- 🚀 **Ultra-léger** : Seulement 13.1KB minifié
- ⚡ **Réactif** : Mises à jour automatiques du DOM lors des changements d'état
- 📱 **Moderne** : Compatible ES6+ et navigateurs modernes
- 🎯 **Simple** : Syntaxe intuitive et facile à apprendre
- 🔧 **Flexible** : S'intègre facilement aux projets existants
- 📦 **Sans dépendances** : Complètement autonome

### Démarrage Rapide

```html
<!DOCTYPE html>
<html>
<head>
    <script src="vortex-engine.js"></script>
</head>
<body vx-zone>
    <div>
        <h1 vx-bind="title">Titre par défaut</h1>
        <p vx-bind="message">Message par défaut</p>
        <button vx-on:click="updateContent()">Mettre à jour</button>
    </div>

    <script>
        const app = VortexEngine.createEngine({
            title: 'Bonjour VortexEngine !',
            message: 'Ceci est votre premier exemple avec VortexEngine'
        });

        function updateContent() {
            app.setState({
                title: 'Contenu Mis à Jour !',
                message: 'L\'état a changé de manière réactive'
            });
        }

        app.mount();
    </script>
</body>
</html>
```

---

## Commencer

### Installation

VortexEngine peut être utilisé de plusieurs façons :

#### 1. CDN (Recommandé pour le développement rapide)

```html
<script src="https://cdn.jsdelivr.net/npm/vortexjs@latest/vortex-engine.js"></script>
```

#### 2. Téléchargement Direct

Téléchargez `vortex-engine.js` et incluez-le dans votre projet :

```html
<script src="path/to/vortex-engine.js"></script>
```

#### 3. NPM (Pour les projets Node.js)

```bash
npm install vortexjs
```

Puis importez-le :

```javascript
import Vortex from 'vortexjs';
```

### Configuration de Base

Pour commencer avec VortexEngine, vous devez :

1. **Inclure le script** dans votre HTML
2. **Définir une zone** avec `vx-zone`
3. **Créer une instance du moteur** avec l'état initial
4. **Monter l'application**

```html
<!DOCTYPE html>
<html>
<head>
    <script src="vortex-engine.js"></script>
</head>
<body vx-zone>
    <!-- Votre contenu ici -->
    <script>
        const app = VortexEngine.createEngine({
            // état initial
        });
        app.mount();
    </script>
</body>
</html>
```

---

## Concepts de Base

### Moteur d'État Réactif

VortexEngine utilise un moteur d'état réactif qui met automatiquement à jour le DOM lorsque l'état change :

```javascript
const app = VortexEngine.createEngine({
    count: 0,
    name: 'Utilisateur',
    isVisible: true
});

// Mettre à jour l'état
app.setState({
    count: app.state.count + 1
});

// Mises à jour multiples
app.setState({
    count: 5,
    name: 'Nouvel Utilisateur'
});
```

### Zones et Portée

Les **zones** définissent la portée où VortexEngine peut opérer. Utilisez `vx-zone` pour marquer les zones contrôlées par VortexEngine :

```html
<!-- Zone globale -->
<body vx-zone>
    <h1 vx-bind="title"></h1>
</body>

<!-- Zone spécifique -->
<div vx-zone>
    <p vx-bind="message"></p>
</div>
```

### Liaison de Données

Utilisez `vx-bind` pour lier les propriétés de l'état aux éléments :

```html
<h1 vx-bind="title">Titre par défaut</h1>
<p vx-bind="'Bonjour ' + userName">Bonjour Invité</p>
<span vx-bind="count * 2">0</span>
```

---

## Référence de l'API

### VortexEngine.createEngine(initialState)

Crée une nouvelle instance du moteur VortexEngine.

**Paramètres :**
- `initialState` (Object) : L'état initial de l'application

**Retourne :** Instance du moteur VortexEngine

```javascript
const app = VortexEngine.createEngine({
    counter: 0,
    users: [],
    settings: {
        theme: 'dark',
        language: 'fr'
    }
});
```

### engine.setState(newState)

Met à jour l'état de l'application et déclenche le re-rendu.

**Paramètres :**
- `newState` (Object) : Objet avec les propriétés d'état à mettre à jour

```javascript
app.setState({
    counter: 10,
    'settings.theme': 'light' // Notation par points pour objets imbriqués
});
```

### engine.state

Propriété en lecture seule contenant l'état actuel.

```javascript
console.log(app.state.counter); // Accès en lecture
// app.state.counter = 5; // NE faites PAS cela ! Utilisez setState()
```

### engine.mount()

Monte l'application et active la réactivité.

```javascript
app.mount();
```

### engine.unmount()

Démonte l'application et nettoie les event listeners.

```javascript
app.unmount();
```

### engine.addEffect(callback)

Ajoute un effet qui s'exécute lors des changements d'état.

**Paramètres :**
- `callback` (Function) : Fonction à exécuter à chaque changement d'état

```javascript
app.addEffect(() => {
    console.log('L\'état a changé :', app.state);
});
```

---

## Directives

### vx-zone

Définit la portée où VortexEngine peut opérer.

```html
<div vx-zone>
    <!-- Seul le contenu dans cette zone sera réactif -->
    <p vx-bind="message"></p>
</div>
```

### vx-bind

Lie une expression au contenu de l'élément.

```html
<h1 vx-bind="title">Titre par défaut</h1>
<p vx-bind="'Utilisateur : ' + username">Utilisateur : Anonyme</p>
<span vx-bind="count > 10 ? 'Élevé' : 'Bas'">Bas</span>
```

### vx-show

Affiche ou cache l'élément selon une condition.

```html
<div vx-show="isLoggedIn">
    <p>Content de vous revoir !</p>
</div>

<div vx-show="items.length > 0">
    <p>Vous avez des éléments dans votre liste</p>
</div>
```

### vx-on:event

Attache des event listeners aux éléments.

```html
<button vx-on:click="increment()">Incrémenter</button>
<input vx-on:input="updateName(event.target.value)" />
<form vx-on:submit="handleSubmit(event)">
    <!-- contenu du formulaire -->
</form>
```

### vx-model

Liaison bidirectionnelle pour les éléments de formulaire.

```html
<input vx-model="username" placeholder="Entrez votre nom" />
<textarea vx-model="message"></textarea>
<select vx-model="selectedOption">
    <option value="a">Option A</option>
    <option value="b">Option B</option>
</select>
```

### vx-for

Itère sur des tableaux ou objets.

```html
<!-- Tableaux -->
<ul>
    <li vx-for="user in users" vx-bind="user.name">
        Nom d'utilisateur
    </li>
</ul>

<!-- Tableaux avec index -->
<ul>
    <li vx-for="(user, index) in users" vx-bind="index + ': ' + user.name">
        Entrée utilisateur
    </li>
</ul>

<!-- Objets -->
<div>
    <p vx-for="(value, key) in settings" vx-bind="key + ': ' + value">
        Paramètre
    </p>
</div>
```

### vx-if

Rendu conditionnel.

```html
<div vx-if="user.isAdmin">
    <p>Panneau d'administration</p>
</div>

<div vx-if="score >= 80">
    <p>Excellent score !</p>
</div>
```

---

## Fonctionnalités Avancées

### État Imbriqué

VortexEngine supporte les objets d'état profondément imbriqués :

```javascript
const app = VortexEngine.createEngine({
    user: {
        profile: {
            name: 'Jean',
            settings: {
                theme: 'dark',
                notifications: true
            }
        }
    }
});

// Mettre à jour les propriétés imbriquées
app.setState({
    'user.profile.name': 'Marie',
    'user.profile.settings.theme': 'light'
});
```

### Effets et Observateurs

Exécutez du code lorsque l'état change :

```javascript
// Effet simple
app.addEffect(() => {
    document.title = `Compteur : ${app.state.count}`;
});

// Effet conditionnel
app.addEffect(() => {
    if (app.state.user.isLoggedIn) {
        console.log('Utilisateur connecté');
    }
});
```

### Instances Multiples

Vous pouvez avoir plusieurs instances VortexEngine sur la même page :

```html
<div vx-zone data-vx-engine="app1">
    <p vx-bind="message">Message de l'App 1</p>
</div>

<div vx-zone data-vx-engine="app2">
    <p vx-bind="message">Message de l'App 2</p>
</div>

<script>
    const app1 = VortexEngine.createEngine({ message: 'Bonjour de l\'App 1' });
    const app2 = VortexEngine.createEngine({ message: 'Bonjour de l\'App 2' });
    
    app1.mount('app1');
    app2.mount('app2');
</script>
```

---

## Exemples

### Exemple 1 : Compteur Simple

```html
<!DOCTYPE html>
<html>
<head>
    <script src="vortex-engine.js"></script>
</head>
<body vx-zone>
    <h1>Compteur : <span vx-bind="count">0</span></h1>
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

### Exemple 2 : Liste de Tâches

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
    <h1>Liste de Tâches</h1>
    
    <div>
        <input vx-model="newTodo" placeholder="Ajouter une nouvelle tâche" />
        <button vx-on:click="addTodo()">Ajouter</button>
    </div>

    <div vx-for="(todo, index) in todos" class="todo-item">
        <span vx-bind="todo.text" 
              vx-class="{ completed: todo.completed }">
        </span>
        <button vx-on:click="toggleTodo(index)">
            <span vx-bind="todo.completed ? 'Annuler' : 'Compléter'"></span>
        </button>
        <button vx-on:click="removeTodo(index)">Supprimer</button>
    </div>

    <p>Total : <span vx-bind="todos.length">0</span> | 
       Complétées : <span vx-bind="completedCount">0</span></p>

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

## Performance et Bonnes Pratiques

### Optimisation des Performances

1. **Évitez les Mutations Directes de l'État**
   ```javascript
   // ❌ Incorrect
   app.state.items.push(newItem);
   
   // ✅ Correct
   app.setState({ items: [...app.state.items, newItem] });
   ```

2. **Utilisez des Expressions Simples dans les Directives**
   ```html
   <!-- ❌ Évitez la logique complexe -->
   <div vx-bind="items.filter(i => i.active).map(i => i.name).join(', ')"></div>
   
   <!-- ✅ Utilisez des propriétés calculées -->
   <div vx-bind="activeItemNames"></div>
   ```

3. **Groupez les Mises à Jour de l'État**
   ```javascript
   // ❌ Mises à jour multiples
   app.setState({ name: 'Jean' });
   app.setState({ age: 25 });
   app.setState({ city: 'Paris' });
   
   // ✅ Une seule mise à jour
   app.setState({ 
       name: 'Jean', 
       age: 25, 
       city: 'Paris' 
   });
   ```

### Bonnes Pratiques

1. **Organisez votre État**
   ```javascript
   const app = VortexEngine.createEngine({
       // Données UI
       ui: {
           isLoading: false,
           currentPage: 1,
           showModal: false
       },
       // Données de l'application
       data: {
           users: [],
           posts: []
       },
       // Configuration
       config: {
           theme: 'light',
           language: 'fr'
       }
   });
   ```

2. **Utilisez des Fonctions pour la Logique Complexe**
   ```javascript
   function updateUser(userId, updates) {
       const users = app.state.data.users.map(user => 
           user.id === userId ? { ...user, ...updates } : user
       );
       app.setState({ 'data.users': users });
   }
   ```

3. **Gérez les Erreurs Élégamment**
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

## Guide de Migration

### Depuis jQuery

```javascript
// jQuery
$('#counter').text(count);
$('#button').on('click', function() {
    count++;
    $('#counter').text(count);
});

// VortexEngine
<span id="counter" vx-bind="count">0</span>
<button vx-on:click="increment()">Incrémenter</button>

const app = VortexEngine.createEngine({ count: 0 });
function increment() {
    app.setState({ count: app.state.count + 1 });
}
```

### Depuis React (Conceptuellement Similaire)

```javascript
// React
const [count, setCount] = useState(0);
return <span>{count}</span>;

// VortexEngine
<span vx-bind="count">0</span>
const app = VortexEngine.createEngine({ count: 0 });
// Utilisez app.setState({ count: newValue })
```

---

## Dépannage

### Problèmes Courants

**1. Les Directives Ne Fonctionnent Pas**
- Assurez-vous que l'élément est dans une zone `vx-zone`
- Vérifiez que `app.mount()` a été appelé
- Consultez la console du navigateur pour les erreurs

**2. L'État Ne Se Met Pas à Jour**
- Utilisez toujours `setState()` pour mettre à jour l'état
- Ne mutez pas directement `app.state`

**3. Les Event Listeners Ne Fonctionnent Pas**
- Assurez-vous que les fonctions sont définies globalement
- Vérifiez la syntaxe de `vx-on:event`

**4. Les Expressions Ne S'Évaluent Pas**
- Les expressions sont évaluées dans le contexte global
- Utilisez `app.state.propertyName` pour accéder à l'état dans les expressions

### Débogage

```javascript
// Activez le mode débogage
Vortex.debug = true;

// Inspectez l'état actuel
console.log(app.state);

// Suivez les changements d'état
app.addEffect(() => {
    console.log('État mis à jour :', app.state);
});
```

---

## API Complète

### Constructeur
- `VortexEngine.createEngine(initialState)` - Crée une nouvelle instance

### Méthodes d'Instance
- `engine.setState(updates)` - Met à jour l'état
- `engine.mount(engineName?)` - Monte l'application
- `engine.unmount()` - Démonte l'application
- `engine.addEffect(callback)` - Ajoute un effet

### Propriétés
- `engine.state` - État actuel (lecture seule)

### Directives
- `vx-zone` - Définit la portée de VortexEngine
- `vx-bind` - Lie les expressions au contenu
- `vx-show` - Visibilité conditionnelle
- `vx-if` - Rendu conditionnel
- `vx-for` - Itération sur tableaux/objets
- `vx-on:event` - Event listeners
- `vx-model` - Liaison bidirectionnelle
- `vx-class` - Classes CSS conditionnelles

---

Amusez-vous à créer des applications incroyables avec VortexEngine ! 🌪️
