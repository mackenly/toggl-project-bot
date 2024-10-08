export interface Env {
	// Environment variables
	WORKSPACE_IDENTIFIER: number;
	TOGGL_AUTH: string; // this is a secret
	PROJECT_NAME_SEPARATOR: string;
	PROJECT_NAMES: string;
	PROJECT_COLORS: string;
	PROJECT_CLIENTS: string;
	PROJECT_ESTIMATES: string;
	PREMIUM_ACCOUNT: boolean;
}

// Define the interface for a request body
interface RequestBody {
	active?: boolean,
	auto_estimates?: boolean,
	billable?: boolean,
	client_id?: number,
	color?: string,
	estimated_hours?: number,
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
	estimated_hours?: string,
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
	/**
	 * scheduled - Handle the scheduled event - Docs https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/#docs-content
	 * @param event The event object
	 * @param env Environment variables - uses the Env interface
	 * @param ctx Execution context
	 */
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		let resp = await handleRequest(env, ctx);
		let wasSuccessful = resp.ok ? 'success' : 'fail';

		console.log(`trigger fired at ${event.cron}: ${wasSuccessful}`);
	},
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
	const estimates: Array<string> = commaSeparatedStringToArray(env.PROJECT_ESTIMATES);

	if (!env.TOGGL_AUTH) {
		console.error('TOGGL_AUTH is not set');
		return new Response('TOGGL_AUTH is not set', { status: 500 });
	}

	if (projects.length !== colors.length) {
		console.error('The number of projects and colors must match');
		return new Response('The number of projects and colors must match', { status: 500 });
	}

	if (projects.length !== clients.length) {
		console.error('The number of projects and clients must match');
		return new Response('The number of projects and clients must match', { status: 500 });
	}

	if (projects.length !== estimates.length) {
		console.error('The number of projects and estimates must match');
		return new Response('The number of projects and estimates must match', { status: 500 });
	}

	let errors: Array<string> = [];

	projects.forEach(async (project, index) => {
		const response: FetchResponse = await createProject(env, {
			workspace_id: env.WORKSPACE_IDENTIFIER,
			active: true,
			auto_estimates: false,
			estimated_hours: estimates[index],
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
		console.error(errors.join(', '));
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
	estimated_hours = "",
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

	if (estimated_hours && estimated_hours != "none" && !isNaN(parseInt(estimated_hours))) {
		body.estimated_hours = parseInt(estimated_hours);
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
export function nameBuilder(name: string, date: Date, env: Env) {
	return `${name.trim()} ${env.PROJECT_NAME_SEPARATOR.trim()} ${date.getMonth() + 1}/${date.getFullYear()}`
}

/**
 * commaSeparatedStringToArray - Convert a comma separated string to an array
 * @param str Comma separated string
 * @returns Array<string> of strings
 * @example commaSeparatedStringToArray('a, b, c') // ['a', 'b', 'c']
 */
export function commaSeparatedStringToArray(str: string) {
	return str.split(',').map(item => item.trim());
}