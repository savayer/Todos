<script>
	let task = ''
	let description = ''

	let newTask = {
		name: '',
		description: ''
	}

	let adding = false

	let todos = [
		{ name: 'Svelte', description: 'Testing Svelte', editable: false },
		{ name: 'React', description: 'Testing React', editable: false },
		{ name: 'Vue', description: 'Consolidate knowledge', editable: false }
	]

	const deleteTask = e => {
		const index = +e.target.getAttribute('data-index')
		if (confirm(`Delete ${todos[index].name} task?`)) {
			/*Because Svelte's reactivity is triggered by assignments, using array methods like push and splice won't automatically cause updates. For example, clicking the button doesn't do anything.*/
			todos.splice(index, 1)
			todos = todos
		}
	}
	
	const showEditingInputs = e => {
		const index = +e.target.closest('.tasks__action').getAttribute('data-index')
		task = todos[index].name
		description = todos[index].description
		todos[index].editable = true
	}

	const editTask = e => {
		const index = +e.target.closest('.tasks__action').getAttribute('data-index')
		todos[index].name = task
		todos[index].description = description
		todos[index].editable = false
	}

	const addTodo = () => {
		newTask.editable = false
		todos.push(newTask)
		todos = todos
		newTask = { name: '', description: '' }
	}
</script>

<div class="wrapper">
	<h1 class="text-center">To Do!</h1>	

	<div class="tasks">
		{#each todos as todo, i}
			<div class="tasks__item">
				<div class="tasks__number"> { i+1 } </div>
				<div class="tasks__name">
					{#if !todo.editable}					
						<span>{ todo.name }</span>
					{:else}
						<input type="text" bind:value="{task}">
					{/if}
				</div>
				<div class="tasks__description">
					{#if !todo.editable}					
						<span>{ todo.description }</span>
					{:else}
						<input type="text" bind:value="{description}">
					{/if}
				</div>
				<div class="tasks__action" data-index="{i}">
					{#if !todo.editable}											
						<button class="tasks__edit" type="button" on:click="{showEditingInputs}">Edit</button>
					{:else}
						<div class="group">
							<a href="#edit" class="tasks__save" title="save" on:click|preventDefault="{editTask}">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="green" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
							</a>
							<a href="#cancel" class="tasks__cancel" title="cancel" on:click|preventDefault="{e => todo.editable = false}">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="red" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
							</a>
						</div>
					{/if}
					<button class="tasks__delete" type="button" data-index="{i}" on:click="{deleteTask}">Delete</button>
				</div>
			</div>
		{/each}

		<div class="tasks__add_wrapper">
			<button class="tasks__add" on:click="{e => adding = !adding}">+</button>
		</div>

		<div class="tasks__adding" class:active="{ adding }" title="Add new task">
			<input type="text" bind:value="{newTask.name}" placeholder="Name">
			<input type="text" bind:value="{newTask.description}" placeholder="description">
			<a href="#add" on:click|preventDefault="{addTodo}">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="blue"/><path d="M0 0h24v24H0z" fill="none"/></svg>
			</a>
		</div>
	</div>
</div>

<style lang="scss">
	.wrapper {
		max-width: 980px;
		margin: auto;
	}

	h1 {
		font-size: 3em;
		font-weight: 200;
		color: #3f3f3f;
	}

	.text-center {
		text-align: center;
	}

	.tasks {
		max-width: 70%;
		margin: 3rem auto 0;
	}

	.tasks__item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 10px 0;
		padding: 10px 0;
		border-bottom: 1px solid rgba(204, 204, 204, 0.329);
	}

	.tasks__name {
		font-weight: bold;
	}

	.tasks__description {
		flex-basis: 200px;
	}

	.tasks__action {
		display: flex;
	}

	.tasks__save {
		margin-right: 5px;
	}

	button {
		margin: 0 5px;
		border: none;
		padding: 6px 10px;
		border-radius: 2px;
		color: #fff;
		transition: background .2s;
		cursor: pointer;
	}

	.tasks__delete {
		background-color: #ee5b5b;
		&:hover {
			background-color: #ec2f2f;
		}
	}

	.tasks__edit {
		background-color: #37d337;
		&:hover {
			background-color: #25af25;
		}
	}

	.tasks__add_wrapper {
		text-align: right;
	}

	.tasks__add {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 1.25rem;
		background-color: #6f6fec;		
		font-size: 1.25em;
		padding: 0;
		margin-top: 2rem;
		outline: none;
		&:hover {
			background-color: #4a4ad4;
		}
	}

	.tasks__adding {
		display: flex;
		justify-content: space-around;
		align-items: center;
		margin-top: 40px;
		opacity: 0;
		transition: .3s;
		&.active {
			opacity: 1;
		}
		input {
			padding: 8px;
			border-radius: 3px;
			border: 1px solid rgba(204, 204, 204, 0.637);
			margin-right: 15px;
			font-size: 16px;
			&:first-child {
				flex-grow: 1;            
			}
			&:nth-child(2) {
				flex-grow: 20;
			}
		}
		a {
			flex-grow: 1;
			cursor: pointer;
		}
	}
</style>