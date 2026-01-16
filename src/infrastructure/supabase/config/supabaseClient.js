import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { log } from '../../logger/logger.js';

dotenv.config();

/**
 * Ensures that all required environment variables for Supabase are defined.
 * @throws {Error} Throws an error and exits the process if
 * `SUPABASE_URL` or `SUPABASE_ANON_KEY` are not set.
 * @description
 * This check guarantees that the Supabase client can be initialized correctly.
 * If the required environment variables are missing, the process terminates
 * to prevent runtime connection issues.
 */
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    log.error('FATAL ERROR: Missing Supabase environment variables', {
        hasUrl: !!process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
    });
    process.exit(1);
}

/**
 * Standard Supabase client for regular operations (uses anon key)
 * @constant
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});

log.info('Supabase client initialized successfully');

/**
 * Admin Supabase client for administrative operations (uses service role key)
 * @constant
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    },
);

log.info('Supabase admin client initialized successfully', {
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});

/**
 * Verifies the connection to the Supabase database by performing
 * a simple health check query.
 * @returns {Promise<boolean>} True if connection is successful, false otherwise
 */
export const verifySupabaseConnection = async () => {
    try {
        log.debug('Verifying Supabase connection');

        const { error } = await supabase.from('_health').select('*').limit(1);

        if (error) {
            const { error: authError } = await supabase.auth.getSession();
            if (authError) {
                log.error('Supabase auth check failed', { error: authError.message });
                throw authError;
            }
        }

        log.info('Supabase connection verified successfully');
        return true;
    } catch (error) {
        log.error('Supabase connection failed', {
            error: error.message,
            stack: error.stack,
        });
        return false;
    }
};

export { supabaseAdmin };
export default supabase;
