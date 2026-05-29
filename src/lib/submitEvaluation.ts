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
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  );
}
