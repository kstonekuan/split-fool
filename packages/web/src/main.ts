import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";

const target = document.getElementById("app");
if (!target) {
	throw new Error("No target element found");
}

const app = mount(App, {
	target,
});

export default app;
