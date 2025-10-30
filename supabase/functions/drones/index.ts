import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathname = url.pathname.replace(/^\/drones/, '') || '/';

    // GET /drones - List drones with optional status filter
    if (req.method === 'GET' && pathname === '/') {
      const status = url.searchParams.get('status');
      
      let query = supabase
        .from('drones')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify(data),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // GET /summary - Get drone statistics summary
    if (req.method === 'GET' && pathname === '/summary') {
      const { data, error } = await supabase
        .from('drones')
        .select('status');

      if (error) {
        throw error;
      }

      const connectedCount = data.filter(d => d.status === 'connected').length;
      const disconnectedCount = data.filter(d => d.status === 'disconnected').length;
      const errorCount = data.filter(d => d.status === 'error').length;
      const totalCount = data.length;

      return new Response(
        JSON.stringify({
          connectedCount,
          disconnectedCount,
          errorCount,
          totalCount,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // GET /:id - Get single drone
    if (req.method === 'GET' && pathname.startsWith('/') && pathname.split('/').length === 2 && pathname !== '/') {
      const droneId = pathname.split('/')[1];
      
      const { data, error } = await supabase
        .from('drones')
        .select('*')
        .eq('drone_id', droneId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'Drone not found' }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      return new Response(
        JSON.stringify(data),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // POST / - Create new drone
    if (req.method === 'POST' && pathname === '/') {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('drones')
        .insert(body)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify(data),
        {
          status: 201,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // PUT /:id - Update drone
    if (req.method === 'PUT' && pathname.startsWith('/') && pathname.split('/').length === 2) {
      const droneId = pathname.split('/')[1];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('drones')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('drone_id', droneId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify(data),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // DELETE /:id - Delete drone
    if (req.method === 'DELETE' && pathname.startsWith('/') && pathname.split('/').length === 2) {
      const droneId = pathname.split('/')[1];
      
      const { error } = await supabase
        .from('drones')
        .delete()
        .eq('drone_id', droneId);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ message: 'Drone deleted successfully' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});