import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json();
    const {
      firstName, lastName, email, phone,
      companyName, sector, city,
      currentWebsite, socialMedia,
      needs, problems, package: pkg, message,
      productId,
    } = body;

    const fullName = `${firstName} ${lastName}`.trim();

    // 1. Vérifier si le profil existe déjà
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    let profileId: string;

    if (existingProfile) {
      profileId = existingProfile.id as string;
    } else {
      // 2. Créer l'utilisateur auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (authError) throw authError;

      profileId = authData.user.id;

      // 3. Créer le profil (upsert pour gérer un éventuel trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          { id: profileId, email, full_name: fullName, phone, role: 'client' },
          { onConflict: 'id' },
        );
      if (profileError) throw profileError;
    }

    // 4. Créer la company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({ name: companyName, sector, city, profile_id: profileId })
      .select('id')
      .single();
    if (companyError) throw companyError;

    // 5. Créer le projet
    const projectPayload: Record<string, unknown> = {
      title: "Demande d'évaluation gratuite",
      status: 'nouveau',
      priority: 'normale',
      purchased_at: new Date().toISOString(),
      profile_id: profileId,
      company_id: (company as { id: string }).id,
    };
    if (productId) projectPayload.product_id = productId;

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectPayload)
      .select('id')
      .single();
    if (projectError) throw projectError;

    // 6. Créer le questionnaire
    const answers = {
      business: { companyName, sector, city },
      current_presence: { website: currentWebsite, socialMedia },
      needs,
      problems: problems ? [problems] : [],
      package: pkg,
      message,
    };

    const { error: questionnaireError } = await supabase
      .from('questionnaires')
      .insert({ project_id: (project as { id: string }).id, answers });
    if (questionnaireError) throw questionnaireError;

    return new Response(
      JSON.stringify({ projectId: (project as { id: string }).id, profileId, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erreur inconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
