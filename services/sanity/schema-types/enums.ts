export const CATEGORY_VALUES = ['B', 'A', 'A1', 'A2', 'B1', 'C', 'D', 'AM'] as const

export type Category = (typeof CATEGORY_VALUES)[number]

export const QUESTION_TYPE = ['basic', 'specialist'] as const
export type QuestionType = (typeof QUESTION_TYPE)[number]

export const TAGS = [
  'road-signs',
  'traffic-rules',
  'right-of-way',
  'speed-limits',
  'vehicle-control',
  'safety-distance',
  'first-aid',
  'accident-handling',
  'vehicle-maintenance',
  'weather-conditions',
  'urban-driving',
  'highway-driving',
  'motorcycle-specific',
  'truck-specific',
  'risk-perception',
] as const

export type Tag = (typeof TAGS)[number]
