// @ts-nocheck

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Verify the request is from Supabase cron
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Service role client — bypasses RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const now = new Date().toISOString()

    // Step 1: Find all expired available listings
    const { data: expiredListings, error: fetchError } =
      await supabase
        .from('food_listings')
        .select(`
          id,
          title,
          provider_id,
          quantity_number,
          tasks (id, status)
        `)
        .eq('status', 'available')
        .lt('expiry_time', now)

    if (fetchError) {
      console.error('Fetch error:', fetchError.message)
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500 }
      )
    }

    if (!expiredListings || expiredListings.length === 0) {
      console.log('No expired listings found.')
      return new Response(
        JSON.stringify({ expired: 0, message: 'Nothing to expire' }),
        { status: 200 }
      )
    }

    console.log(`Found ${expiredListings.length} expired listings`)

    const listingIds = expiredListings.map(l => l.id)

    // Step 2: Update listings to 'expired'
    const { error: listingUpdateError } = await supabase
      .from('food_listings')
      .update({ status: 'expired' })
      .in('id', listingIds)
      .eq('status', 'available')

    if (listingUpdateError) {
      console.error('Listing update error:', listingUpdateError.message)
    }

    // Step 3: Update associated tasks to 'expired'
    const taskIds = expiredListings
      .flatMap(l => l.tasks || [])
      .filter(t => t.status === 'available')
      .map(t => t.id)

    if (taskIds.length > 0) {
      const { error: taskUpdateError } = await supabase
        .from('tasks')
        .update({ status: 'expired' })
        .in('id', taskIds)

      if (taskUpdateError) {
        console.error('Task update error:', taskUpdateError.message)
      }
    }

    // Step 4: Insert notifications for each provider
    const notifications = expiredListings.map(listing => ({
      user_id:    listing.provider_id,
      listing_id: listing.id,
      type:       'listing_expired',
      message:    `Your listing "${listing.title}" expired without being claimed. Consider reposting with a later expiry time.`,
      is_read:    false,
    }))

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notifError) {
        console.error('Notification error:', notifError.message)
      }
    }

    console.log(
      `Successfully expired ${expiredListings.length} listings`
    )

    return new Response(
      JSON.stringify({
        expired:  expiredListings.length,
        listings: expiredListings.map(l => l.title),
        message:  'Expiry job complete'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    )
  }
})
