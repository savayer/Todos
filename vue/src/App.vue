<template>
    <div id="app">
        <div class="wrapper">
            <h1 class="text-center">To Do!</h1>

            <div class="tasks">
                <div v-for="(todo, i) in todos" :key="i" class="tasks__item">
                    <div class="tasks__number"> {{ i+1 }} </div>
                    <div class="tasks__name">
                        <span v-if="!todo.editable">
                            {{ todo.name }}
                        </span>
                        <input v-else type="text" v-model="task">
                    </div>
                    <div class="tasks__description">
                        <span v-if="!todo.editable">
                            {{ todo.description }}
                        </span>
                        <input v-else type="text" v-model="description">
                    </div>
                    <div class="tasks__action">
                        <button v-if="!todo.editable" class="tasks__edit" type="button" @click="showEditingInputs(i)">Edit</button>
                        <div v-else class="group">
                            <a href="#" class="tasks__save" title="save" @click.prevent="editTask(i)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="green" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            </a>
                            <a href="#" class="tasks__cancel" title="cancel" @click.prevent="todo.editable = false">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="red" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                            </a>
                        </div>
                        <button class="tasks__delete" type="button" @click="deleteTask(i)">Delete</button>
                    </div>
                </div>                

                <div class="tasks__add_wrapper">
                    <button class="tasks__add" @click="adding = !adding">+</button>
                </div>

                <div class="tasks__adding" :class="{ active: adding }" title="Add new task">
                    <input type="text" v-model="newTask.name" placeholder="Name">
                    <input type="text" v-model="newTask.description" placeholder="description">
                    <a href="#" @click.prevent="addTodo()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="blue"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "app",
    data() {
        return {
            todos: [
                { name: 'Svelte', description: 'Testing Svelte', editable: false },
                { name: 'React', description: 'Testing React', editable: false },
                { name: 'Vue', description: 'Grow up to Middle level', editable: false }
            ],
            task: '',
            description: '',
            newTask: {
                name: '',
                description: ''
            },
            adding: false
        }
    },
    methods: {
        deleteTask(index) {
            if (confirm(`Delete ${this.todos[index].name} task?`)) {
                this.todos.splice(index, 1)
            }
        },
        showEditingInputs(index) {
            this.task = this.todos[index].name
            this.description = this.todos[index].description
            this.todos[index].editable = true
        },
        editTask(index) {
            /* let todo = {}
            todo.name = this.task
            todo.description = this.description
            todo.editable = false nothing working */
            this.todos[index].name = this.task
            this.todos[index].description = this.description
            this.todos[index].editable = false
        },
        addTodo() {
            this.newTask.editable = false
            this.todos.push(this.newTask)
            this.newTask = { name: '', description: '' }
        }
    }
};
</script>

<style lang="scss" src="./styles/main.scss"></style>