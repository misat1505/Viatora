import { getAssistant } from '@/generated/assistant/assistant';
import { getAuth } from '@/generated/auth/auth';
import { getExams } from '@/generated/exams/exams';
import { getPayments } from '@/generated/payments/payments';
import { getQuestions } from '@/generated/questions/questions';
import { getStats } from '@/generated/stats/stats';
import axios from 'axios';
import { cookies } from 'next/headers';

const axiosBase = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

axiosBase.interceptors.request.use(async (config) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
});

export const authApiClient = getAuth(axiosBase);
export const examsApiClient = getExams(axiosBase);
export const questionsApiClient = getQuestions(axiosBase);
export const paymentsApiClient = getPayments(axiosBase);
export const assistantApiClient = getAssistant(axiosBase);
export const statisticsApiClient = getStats(axiosBase);
