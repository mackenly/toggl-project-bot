export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
	//
	// Example binding to a D1 Database. Learn more at https://developers.cloudflare.com/workers/platform/bindings/#d1-database-bindings
	// DB: D1Database

	// Environment variables
	WORKSPACE_IDENTIFIER: number;
	TOGGL_AUTH: string;
	PROJECT_NAME_SEPARATOR: string;
	PROJECT_NAMES: string;
	PROJECT_COLORS: string;
	PROJECT_CLIENTS: string;
	PREMIUM_ACCOUNT: boolean;
}

// Define the interface for a request body
interface RequestBody {
	active?: boolean,
	auto_estimates?: boolean,
	billable?: boolean,
	client_id?: number,
	color?: string,
	start_date?: string,
	end_date?: string,
	name: string
}

// Define the interface for a project
interface Project {
	workspace_id: number,
	active?: boolean,
	auto_estimates?: boolean,
	billable?: boolean,
	client_id?: number,
	color?: string,
	start_date?: string,
	end_date?: string,
	name: string
}

// Define the interface for a successful response
interface SuccessResponse {
	data: any;
}

// Define the interface for an error response
interface ErrorResponse {
	error: string;
}

// Define the type for the fetch response
type FetchResponse = SuccessResponse | ErrorResponse;

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		// A Cron Trigger can make requests to other endpoints on the Internet,
		// publish to a Queue, query a D1 Database, and much more.
		//
		// We'll keep it simple and make an API call to a Cloudflare API:
		let resp = await handleRequest(env, ctx);
		let wasSuccessful = resp.ok ? 'success' : 'fail';

		// You could store this result in KV, write to a D1 Database, or publish to a Queue.
		// In this template, we'll just log the result:
		console.log(`trigger fired at ${event.cron}: ${wasSuccessful}`);
	},
	// Fetch for testing
	fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
		// The fetch handler is invoked whenever the worker receives an HTTP request.
		// Learn more about Fetch Events at https://developers.cloudflare.com/workers/runtime-apis/fetch-event
		
		// if for favicon, return 404
		if (request.url.endsWith('favicon.ico')) {
			return new Response('Not found', { status: 404 });
		}

		return handleRequest(env, ctx);
	}
};

/**
 * handleRequest - Handle the request
 * @param request Request object
 * @param env Environment variables
 * @param ctx Execution context
 * @returns Response object
 */
async function handleRequest(env: Env, ctx: ExecutionContext): Promise<Response> {
	const date = new Date();
	const projects: Array<string> = commaSeparatedStringToArray(env.PROJECT_NAMES);
	const colors: Array<string> = commaSeparatedStringToArray(env.PROJECT_COLORS);
	const clients: Array<string> = commaSeparatedStringToArray(env.PROJECT_CLIENTS);

	if (projects.length !== colors.length) {
		console.log('The number of projects and colors must match');
		return new Response('The number of projects and colors must match', { status: 500 });
	}

	if (projects.length !== clients.length) {
		console.log('The number of projects and clients must match');
		return new Response('The number of projects and clients must match', { status: 500 });
	}

	let errors: Array<string> = [];

	projects.forEach(async (project, index) => {
		const response: FetchResponse = await createProject(env, {
			workspace_id: env.WORKSPACE_IDENTIFIER,
			active: true,
			auto_estimates: false,
			billable: false,
			client_id: parseInt(clients[index]),
			color: colors[index],
			name: nameBuilder(project, date, env)
		});

		if ('error' in response) {
			errors.push(response.error);
		}
	});

	if (errors.length > 0) {
		return new Response(errors.join(', '), { status: 500 });
	}

	// For some reason it requires this request or it will fail (idk?)
	try {
		const response = await fetch(`https://api.track.toggl.com/api/v9/workspaces/${env.WORKSPACE_IDENTIFIER}/projects`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + btoa(env.TOGGL_AUTH),
			},
		});
	} catch (error) {
		console.error('Error:', error);
	}

	return new Response('Success', { status: 200 });
}

/**
 * createProject - Create a project in Toggl with the API
 * @param env Environment variables
 * @param Object with the project information
 * @returns 
 */
async function createProject(env: Env, {
	workspace_id,
	active = true,
	auto_estimates = false,
	billable = false,
	client_id,
	color = "#000000",
	start_date,
	end_date,
	name
}: Project): Promise<FetchResponse> {
	let body: RequestBody = {
		active: active,
		auto_estimates: auto_estimates,
		client_id: client_id,
		name: name,
	};

	// add optional parameters
	if (start_date) {
		body.start_date = start_date;
	}

	if (end_date) {
		body.end_date = end_date;
	}

	if (env.PREMIUM_ACCOUNT) {
		body.billable = billable;
		body.color = color;
	}

	// make the request
	try {
		await fetch(`https://api.track.toggl.com/api/v9/workspaces/${workspace_id}/projects`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + btoa(env.TOGGL_AUTH),
			},
			body: JSON.stringify(body),
		}).then((response) => {
			if (response.ok) {
				console.log(response.json());
				return response.json();
			} else {
				console.log(response.statusText);
				throw new Error(response.statusText);
			}
		})
		.catch((error) => {
			console.log(error);
			return {
				error: error,
			} as ErrorResponse;
		});
	} catch (error: any) {
		console.log(error);
		return {
			error: error,
		} as ErrorResponse;
	}

	return {
		error: 'Unknown error',
	} as ErrorResponse;
}

/**
 * nameBuilder - Build the name of the project
 * @param name Project name
 * @param date Date object for the month and year
 * @param env Environment variables
 * @returns string formatted project name
 * @example nameBuilder(' Example Project', new Date(), { PROJECT_NAME_SEPARATOR: '-' }) // 'Example Project - 1/2021'
 */
function nameBuilder(name: string, date: Date, env: Env) {
	return `${name.trim()} ${env.PROJECT_NAME_SEPARATOR.trim()} ${date.getMonth() + 1}/${date.getFullYear()}`
}

/**
 * commaSeparatedStringToArray - Convert a comma separated string to an array
 * @param str Comma separated string
 * @returns Array<string> of strings
 * @example commaSeparatedStringToArray('a, b, c') // ['a', 'b', 'c']
 */
function commaSeparatedStringToArray(str: string) {
	return str.split(',').map(item => item.trim());
}