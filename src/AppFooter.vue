<template>
	<div class="layout-footer">
		<h5 class="footerpoint"></h5>
		<h5 class="footerpoint">Aviso Legal</h5>
		<h5 class="footerpoint">Copyright © 2023 eha</h5>
		<h5 class="footerpoint"></h5>
	</div>
</template>

<script>
	export default {
		name: "AppFooter",
		methods: {

		},
		computed: {
			darkTheme() {
				return this.$appState.darkTheme;
			}
		}
	}
</script>
<style>
	.footerpoint{
		margin: 20px;
		color: white;
	}
</style>