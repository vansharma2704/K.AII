import { getResume } from '@/actions/resume';
import ResumeClient from './_components/resume-client';

export default async function ResumePage() {
  let resume = null;
  try {
    resume = await getResume();
  } catch (error) {
    console.error("Failed to fetch resume:", error);
  }

  return <ResumeClient resume={resume} />;
}