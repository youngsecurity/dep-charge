import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		allowLocalPath: env.ALLOW_LOCAL_PATH === 'true'
	};
};
