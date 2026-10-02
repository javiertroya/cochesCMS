import { createRoot } from "react-dom/client";
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

import "./index.css";
import App from "./App.jsx";

const posthogToken = import.meta.env.VITE_POSTHOG_TOKEN
const posthogHost = import.meta.env.VITE_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

if (posthogToken) {
	posthog.init(posthogToken, {
		api_host: posthogHost,
		capture_pageview: false,
		capture_pageleave: true,
		defaults: '2026-01-30',
	})
}

createRoot(document.getElementById("root")).render(
	posthogToken ? (
		<PostHogProvider client={posthog}>
			<App />
		</PostHogProvider>
	) : (
		<App />
	),
);
