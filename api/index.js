// Vercel serverless entry point
// Statically import build-injected env vars so Vercel's tracer bundles them
import './env.js'
import app from '../server/api/index.js'

export const config = {
  runtime: 'nodejs',
}

export default app
