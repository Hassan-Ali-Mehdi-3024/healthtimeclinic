import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Query wrapper to match the existing SQLite API
const pool = {
  query: async (sql, params = []) => {
    try {
      const sqlLower = sql.toLowerCase().trim();
      
      // Simple table name extraction
      const getTable = () => {
        if (sqlLower.includes('from')) return sql.match(/from\s+(\w+)/i)?.[1];
        if (sqlLower.includes('into')) return sql.match(/into\s+(\w+)/i)?.[1];
        if (sqlLower.includes('update')) return sql.match(/update\s+(\w+)/i)?.[1];
        if (sqlLower.includes('delete')) return sql.match(/delete\s+from\s+(\w+)/i)?.[1];
        return null;
      };
      
      const tableName = getTable();
      
      // Handle SELECT
      if (sqlLower.startsWith('select')) {
        // Check if this is a JOIN query
        if (sql.includes('JOIN') || sql.includes('LEFT JOIN')) {
          // For JOIN queries, we need to handle them differently
          // Extract the main table and execute basic select first
          const mainTableMatch = sql.match(/FROM\s+(\w+)\s+\w+/i);
          const mainTable = mainTableMatch?.[1];
          
          if (!mainTable) throw new Error('Cannot determine main table for JOIN query');
          
          // For now, we'll fetch from the main table and handle joins in memory
          // This is a limitation of Supabase's REST API
          let query = supabase.from(mainTable).select('*');
          
          // Handle WHERE conditions
          if (sql.includes('WHERE') && params.length > 0) {
            const whereMatch = sql.match(/where\s+(\w+)\.(\w+)\s*=\s*\?/i);
            if (whereMatch) {
              // Use the column name without the table prefix
              query = query.eq(whereMatch[2], params[0]);
              
              let paramIndex = 1;
              const andMatches = sql.matchAll(/and\s+(\w+)\.(\w+)\s*=\s*\?/gi);
              for (const match of andMatches) {
                if (paramIndex < params.length) {
                  query = query.eq(match[2], params[paramIndex++]);
                }
              }
            }
          }
          
          const { data, error } = await query;
          if (error) throw error;
          return [data || [], []];
        }
        
        let query = supabase.from(tableName).select('*');
        
        // Handle WHERE with =
        if (sql.includes('WHERE') && params.length > 0) {
          const whereMatch = sql.match(/where\s+(\w+)\s*=\s*\?/i);
          if (whereMatch) {
            query = query.eq(whereMatch[1], params[0]);
            
            // Handle additional AND conditions
            const andMatches = sql.matchAll(/and\s+(\w+)\s*=\s*\?/gi);
            let paramIndex = 1;
            for (const match of andMatches) {
              if (paramIndex < params.length) {
                query = query.eq(match[1], params[paramIndex++]);
              }
            }
          }
        }
        
        // Handle ORDER BY
        if (sql.includes('ORDER BY')) {
          const orderMatch = sql.match(/order\s+by\s+(\w+)\s*(asc|desc)?/i);
          if (orderMatch) {
            query = query.order(orderMatch[1], { ascending: !orderMatch[2] || orderMatch[2].toLowerCase() === 'asc' });
          }
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return [data || [], []];
      }
      
      // Handle INSERT
      if (sqlLower.startsWith('insert')) {
        const columnsMatch = sql.match(/\(([^)]+)\)\s+values/i);
        if (!columnsMatch) throw new Error('Invalid INSERT syntax');
        
        const columns = columnsMatch[1].split(',').map(c => c.trim());
        const insertData = {};
        
        // Don't include id field - let Supabase auto-generate it
        columns.forEach((col, i) => {
          if (col !== 'id' && i < params.length) {
            // Convert SQLite integers to PostgreSQL booleans for boolean columns
            if (col.startsWith('is_') || col.startsWith('diagnosis_')) {
              insertData[col] = Boolean(params[i]);
            } else {
              insertData[col] = params[i];
            }
          }
        });
        
        const { data, error} = await supabase.from(tableName).insert(insertData).select();
        if (error) {
          // If duplicate key error, it's likely a sequence issue
          if (error.code === '23505') {
            console.error(`Duplicate key error in ${tableName}. This may indicate a sequence issue. Please run: SELECT setval('${tableName}_id_seq', (SELECT MAX(id) FROM ${tableName}));`);
          }
          throw error;
        }
        return [{ insertId: data?.[0]?.id, lastID: data?.[0]?.id }, []];
      }
      
      // Handle UPDATE
      if (sqlLower.startsWith('update')) {
        // Regex to match "SET column1=?, column2=?, ..."
        // We look for everything between "SET" and "WHERE"
        const setMatch = sql.match(/set\s+([\s\S]+?)\s+where/i);
        if (!setMatch) throw new Error('Invalid UPDATE syntax: Could not find SET/WHERE clause');
        
        // Split by comma, but be careful about newlines
        const setClause = setMatch[1];
        const setParts = setClause.split(',').map(p => p.trim()).filter(p => p);
        
        const updateData = {};
        let paramIndex = 0;
        
        setParts.forEach(part => {
          // part looks like "visit_date = ?" or "notes = ?"
          const paramMatch = part.match(/(\w+)\s*=\s*\?/);
          
          if (paramMatch) {
             // We found a placeholder
             if (paramIndex < params.length) {
                const col = paramMatch[1];
                // Convert to boolean for boolean columns
                if (col.startsWith('is_') || col.startsWith('diagnosis_')) {
                  updateData[col] = Boolean(params[paramIndex]);
                } else {
                  updateData[col] = params[paramIndex];
                }
                paramIndex++;
             }
          } else {
             // Check for literal NULL
             const nullMatch = part.match(/(\w+)\s*=\s*NULL/i);
             if (nullMatch) {
               updateData[nullMatch[1]] = null;
             }
          }
        });
        
        // The remaining params are for the WHERE clause
        // Our simplified parser only supports a single WHERE condition for UPDATE?
        // Wait, the error shows "WHERE id = ? AND patient_id = ?"
        // The current implementation at line 162 only grabs the first one:
        // const whereMatch = sql.match(/where\s+(\w+)\s*=\s*\?/i);
        
        // Let's improve the WHERE handling for UPDATE to support multiple conditions
        // We need to construct a query builder chain
        
        let query = supabase.from(tableName).update(updateData);
        
        // Extract WHERE clause
        const whereClauseMatch = sql.match(/where\s+([\s\S]+)$/i);
        if (!whereClauseMatch) throw new Error('UPDATE requires WHERE clause');
        
        const whereClause = whereClauseMatch[1];
        
        // Simple parser for "col = ? AND col2 = ?"
        // We know we used 'paramIndex' params so far.
        // The rest of params start from params[paramIndex]
        
        // Split by AND
        const conditions = whereClause.split(/\s+and\s+/i);
        
        for (const condition of conditions) {
            const colMatch = condition.match(/(\w+)\s*=\s*\?/);
            if (colMatch && paramIndex < params.length) {
                query = query.eq(colMatch[1], params[paramIndex]);
                paramIndex++;
            }
        }
        
        const { data, error } = await query.select();
        
        if (error) throw error;
        return [{ changes: data?.length || 0 }, []];
      }
      
      // Handle DELETE
      if (sqlLower.startsWith('delete')) {
        const whereMatch = sql.match(/where\s+(\w+)\s*=\s*\?/i);
        if (!whereMatch) throw new Error('DELETE requires WHERE clause');
        
        const { data, error } = await supabase
          .from(tableName)
          .delete()
          .eq(whereMatch[1], params[0]);
        
        if (error) throw error;
        return [{ changes: data?.length || 0 }, []];
      }
      
      throw new Error(`Unsupported SQL: ${sql.substring(0, 50)}`);
    } catch (error) {
      console.error('Database query error:', error, 'SQL:', sql, 'Params:', params);
      throw error;
    }
  }
};

export default pool;

