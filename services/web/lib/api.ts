import { getAuth } from '@/generated/auth/auth';
import { getExams } from '@/generated/exams/exams';
import axios from 'axios';

const axiosBase = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const authApiClient = getAuth(axiosBase);
export const examsApiClient = getExams(axiosBase);
