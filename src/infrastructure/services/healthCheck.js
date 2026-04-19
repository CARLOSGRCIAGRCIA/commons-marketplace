import mongoose from 'mongoose';
import supabase from '../supabase/config/supabaseClient.js';

/**
 * Health check service for monitoring dependencies.
 */
export class HealthCheck {
    /**
     * Check MongoDB connection
     * @returns {Promise<{status: string, latency?: number}>}
     */
    static async checkMongoDB() {
        const start = Date.now();
        try {
            const state = mongoose.connection.readyState;
            const latency = Date.now() - start;

            if (state === 1) {
                return { status: 'healthy', latency };
            }
            return { status: 'unhealthy', reason: `State: ${state}` };
        } catch (error) {
            return { status: 'unhealthy', reason: error.message };
        }
    }

    /**
     * Check Supabase connection
     * @returns {Promise<{status: string, latency?: number}>}
     */
    static async checkSupabase() {
        if (!supabase) {
            return { status: 'disabled', reason: 'Supabase not configured' };
        }

        const start = Date.now();
        try {
            const { error } = await supabase.from('_health').select('*').limit(1);
            const latency = Date.now() - start;

            if (error && error.code !== 'PGRST116') {
                return { status: 'unhealthy', reason: error.message };
            }
            return { status: 'healthy', latency };
        } catch (error) {
            return { status: 'unhealthy', reason: error.message };
        }
    }

    /**
     * Check all dependencies
     * @returns {Promise<object>} Full health status
     */
    static async checkAll() {
        const [mongodb, supabaseResult] = await Promise.all([
            this.checkMongoDB(),
            this.checkSupabase(),
        ]);

        const isHealthy = mongodb.status === 'healthy' && supabaseResult.status !== 'unhealthy';

        return {
            status: isHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks: {
                mongodb,
                supabase: supabaseResult,
            },
        };
    }
}

export default HealthCheck;
