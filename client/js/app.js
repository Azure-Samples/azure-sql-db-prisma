/*global Vue, todoStorage */

API = "http://localhost:7071/api/todo";
HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json' };

(function (exports) {

	'use strict';

	var filters = {
		all: function (todos) {
			return todos;
		},
		active: function (todos) {
			return todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		completed: function (todos) {
			return todos.filter(function (todo) {
				return todo.completed;
			});
		}
	};	

	exports.app = new Vue({

		// the root element that will be compiled
		el: '.todoapp',

		// app initial state
		data: {
			todos: [],
			newTodo: '',
			editedTodo: null,
			visibility: 'all'
		},

		//watch todos change for localStorage persistence
		watch: {
			todos: {
				deep: true,
				handler: function(todo) {
					console.log(todo);
				}
			}
		},

		// computed properties
		// http://vuejs.org/guide/computed.html
		computed: {
			filteredTodos: function () {
				return filters[this.visibility](this.todos);
			},
			remaining: function () {
				return filters.active(this.todos).length;
			},
			allDone: {
				get: function () {
					return this.remaining === 0;
				},
				set: function (value) {
					this.todos.forEach(function (todo) {
						todo.completed = value;
					});
				}
			}
		},

		// initialize data 
		// by loading it from REST API
		created: function() {
			fetch(API + "/", {headers: HEADERS, method: "POST", body: ''})
			.then(res => {
				return res.json();
			})
			.then(res => {				
				this.todos = res;
			})
		},

		// methods that implement data logic.
		// note there's no DOM manipulation here at all.
		methods: {

			pluralize: function (word, count) {
				return word + (count === 1 ? '' : 's');
			},

			addTodo: function () {
				var value = this.newTodo && this.newTodo.trim();
				if (!value) {
					return;
				}
				fetch(API + "/", {headers: HEADERS, method: "POST", body: JSON.stringify({title: value})}).
				then(res => {					
					if (res.status < 500) {												
						this.newTodo = ''
						return res.json();
					}
				}).then(res => {
					console.log(res[0])
					this.todos.push(res[0]);
				})
			},

			removeTodo: function (todo) {
				var index = this.todos.indexOf(todo);
				var id  = todo.id;
				fetch(API + `/${id}`, {headers: HEADERS, method: "DELETE"}).
				then(res => {
					if (res.status < 500) {
						this.todos.splice(index, 1);
					}
				})				
			},

			editTodo: function (todo) {
				this.beforeEditCache = todo.title;
				this.editedTodo = todo;
			},

			doneEdit: function (todo) {
				if (!this.editedTodo) {
					return;
				}
				this.editedTodo = null;
				todo.title = todo.title.trim();
				if (!todo.title) {
					this.removeTodo(todo);
				}
			},

			cancelEdit: function (todo) {
				this.editedTodo = null;
				todo.title = this.beforeEditCache;
			},

			removeCompleted: function () {
				this.todos = filters.active(this.todos);
			}			
		},

		// a custom directive to wait for the DOM to be updated
		// before focusing on the input field.
		// http://vuejs.org/guide/custom-directive.html
		directives: {
			'todo-focus': function (el, binding) {
				if (binding.value) {
					el.focus();
				}
			}
		}
	});

})(window);