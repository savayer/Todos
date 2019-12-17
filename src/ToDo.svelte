<script>
	let todos = [
		{ name: 'Svelte', description: 'Testing Svelte' },
		{ name: 'React', description: 'Testing React' },
		{ name: 'Vue', description: 'Grow up to Middle level' }
	]
</script>

<div class="wrapper">
	<h1 class="text-center">To Do!</h1>

	<div class="tasks">
		{#each todos as todo, i}
			<div class="tasks__item">
				<div class="tasks__number">{i + 1}</div>
				<div class="tasks__name">{ todo.name }</div>
				<div class="tasks__description">{ todo.description }</div>
				<div class="tasks__action">
					<button class="tasks__edit" type="button">Edit</button>
					<button class="tasks__delete" type="button">Delete</button>
				</div>
			</div>
		{/each}

		<div class="tasks__add_wrapper">
			<button class="tasks__add">+</button>
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
		background-color: #3939ee;		
		font-size: 1.25em;
		padding: 0;
		margin-top: 2rem;		
		&:hover {
			background-color: #2828d8;
		}
	}
</style>