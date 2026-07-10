import { getAssistant } from '@/generated/assistant/assistant';
import { getAuth } from '@/generated/auth/auth';
import { getExams } from '@/generated/exams/exams';
import { getPayments } from '@/generated/payments/payments';
import { getQuestions } from '@/generated/questions/questions';
import axios from 'axios';

const axiosBase = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const authApiClient = getAuth(axiosBase);
export const examsApiClient = getExams(axiosBase);
export const questionsApiClient = getQuestions(axiosBase);
export const paymentsApiClient = getPayments(axiosBase);
export const assistantApiClient = getAssistant(axiosBase);
