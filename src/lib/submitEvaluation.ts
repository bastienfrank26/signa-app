import { supabase } from './supabase';

const PRODUCT_IDS: Record<string, string | undefined> = {
  Essentielle: import.meta.env.VITE_PRODUCT_ID_ESSENTIELLE,
  Plus: import.meta.env.VITE_PRODUCT_ID_PLUS,
  Pro: import.meta.env.VITE_PRODUCT_ID_PRO,
  Complète: import.meta.env.VITE_PRODUCT_ID_COMPLETE,
};

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
  const productId = PRODUCT_IDS[data.package] ?? null;

  const { data: result, error: fnError } = await supabase.functions.invoke('submit-evaluation', {
    body: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      sector: data.sector,
      city: data.city,
      currentWebsite: data.currentWebsite,
      socialMedia: data.socialMedia,
      needs: data.needs,
      problems: data.problems,
      package: data.package,
      message: data.message,
      productId,
    },
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
}
