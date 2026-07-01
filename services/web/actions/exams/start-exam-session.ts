'use server';

import { ExamsControllerStartExamSessionResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { cookies } from 'next/headers';

export async function startExamSession(category: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await examsApiClient.examsControllerStartExamSession(
    {
      category,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  return ExamsControllerStartExamSessionResponse.parse(response.data);
}
