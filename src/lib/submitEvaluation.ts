import emailjs from '@emailjs/browser';

export type EvaluationFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  sector: string;
  city: string;
  currentWebsite: string;
  socialMedia: string;
  needs: string[];
  problems: string;
  package: string;
  message: string;
  files: File[];
};

export async function submitEvaluation(data: EvaluationFormData): Promise<void> {
  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      from_name: `${data.firstName} ${data.lastName}`.trim(),
      from_email: data.email,
      phone: data.phone,
      company_name: data.companyName,
      sector: data.sector,
      city: data.city,
      website: data.currentWebsite || 'Aucun',
      social_media: data.socialMedia || 'Aucun',
      needs: data.needs.join(', ') || 'Aucun',
      problems: data.problems || 'Aucun',
      package: data.package,
      message: data.message || 'Aucun',
    },
<<<<<<< HEAD
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  );
=======
  });

  if (fnError) {
    const serverMsg = (result as { error?: string } | null)?.error;
    throw new Error(serverMsg ?? fnError.message);
  }

  const { projectId, profileId, error: resultError } = result as {
    projectId: string;
    profileId: string;
    error?: string;
  };

  if (resultError) throw new Error(resultError);

  for (const file of data.files) {
    const storagePath = `uploads/${projectId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(storagePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { error: fileEntryError } = await supabase
      .from('files')
      .insert({
        project_id: projectId,
        uploaded_by: profileId,
        storage_path: storagePath,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        is_deliverable: false,
      });

    if (fileEntryError) throw new Error(fileEntryError.message);
  }
>>>>>>> 0ae19376c96d7c2f0654c508315bd17b1cdb311e
}
