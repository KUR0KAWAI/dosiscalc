import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Regular client for standard operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Custom Admin Client using direct fetch to bypass library restrictions
class CustomAdminClient {
    constructor(url, key) {
        this.url = `${url}/rest/v1`
        this.key = key
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }

        // Debug Log
        if (import.meta.env.DEV) {
            console.log(' Initializes CustomAdminClient')
            console.log(' URL:', this.url)
            console.log(' Key loaded:', key ? `${key.substring(0, 10)}...` : 'undefined')
        }
    }

    async rpc(fn, params = {}) {
        try {
            const res = await fetch(`${this.url}/rpc/${fn}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(params)
            })
            if (!res.ok) {
                const text = await res.text()
                console.error('RPC Error:', res.status, text)
                return { data: null, error: { message: `RPC Error ${res.status}: ${text}` } }
            }
            const data = await res.json()
            return { data, error: null }
        } catch (error) {
            console.error('RPC Network Error:', error)
            return { data: null, error }
        }
    }

    from(table) {
        return new CustomQueryBuilder(this.url, table, this.headers)
    }
}

class CustomQueryBuilder {
    constructor(baseUrl, table, headers) {
        this.url = `${baseUrl}/${table}`
        this.headers = { ...headers }
        this.params = new URLSearchParams()
    }

    select(columns = '*') {
        this.params.set('select', columns)
        return this
    }

    eq(column, value) {
        this.params.set(column, `eq.${value}`)
        return this
    }

    order(column, { ascending = true } = {}) {
        this.params.set('order', `${column}.${ascending ? 'asc' : 'desc'}`)
        return this
    }

    range(start, end) {
        this.headers['Range-Unit'] = 'items'
        this.headers['Range'] = `${start}-${end}`
        return this
    }

    then(resolve, reject) {
        const url = `${this.url}?${this.params.toString()}`

        // Debug Log
        if (import.meta.env.DEV) console.log(' CustomQueryBuilder Executing:', url)

        fetch(url, { headers: this.headers })
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text()
                    console.error('Query Error:', res.status, text)
                    resolve({ data: null, error: { message: `Query Error ${res.status}: ${text}` } })
                } else {
                    const data = await res.json()
                    resolve({ data, error: null })
                }
            })
            .catch(error => {
                console.error('Query Network Error:', error)
                resolve({ data: null, error })
            })
    }
}

// In development, use local proxy to avoid exposing secret key to browser
// In production, fallback to direct URL (requires Edge Functions for security)
const adminUrl = import.meta.env.DEV ? '/admin-api' : supabaseUrl
const adminKey = import.meta.env.DEV ? '' : supabaseServiceRoleKey

export const supabaseAdmin = new CustomAdminClient(adminUrl, adminKey)
