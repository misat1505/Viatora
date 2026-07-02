import { ExamsControllerGetExamSessionResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const getExamById = safeServerAction(async (id: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await examsApiClient.examsControllerGetExamSession(id, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return ExamsControllerGetExamSessionResponse.parse(response.data);
});
