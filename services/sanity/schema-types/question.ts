import {defineField, defineType} from 'sanity'
import {CATEGORY_VALUES, QUESTION_TYPE, TAGS} from './enums'

export default defineType({
  name: 'question',
  title: 'Question',
  type: 'document',

  fields: [
    // ─────────────────────────────
    // IDENTIFICATION
    // ─────────────────────────────

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'text.pl',
        maxLength: 96,
      },
    }),

    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: CATEGORY_VALUES.map((c) => ({title: c, value: c})),
      },
      validation: (Rule) => Rule.min(1),
    }),

    defineField({
      name: 'questionType',
      title: 'Question type',
      type: 'string',
      options: {
        list: QUESTION_TYPE.map((t) => ({
          title: t,
          value: t,
        })),
      },
      validation: (Rule) => Rule.required(),
    }),

    // ─────────────────────────────
    // CONTENT (i18n)
    // ─────────────────────────────

    defineField({
      name: 'text',
      title: 'Question text',
      type: 'object',
      fields: [
        {name: 'pl', type: 'text', title: 'Polish'},
        {name: 'en', type: 'text', title: 'English'},
      ],
    }),

    defineField({
      name: 'options',
      title: 'Options',
      type: 'object',
      fields: [
        {
          name: 'a',
          type: 'object',
          fields: [
            {name: 'pl', type: 'string'},
            {name: 'en', type: 'string'},
          ],
        },
        {
          name: 'b',
          type: 'object',
          fields: [
            {name: 'pl', type: 'string'},
            {name: 'en', type: 'string'},
          ],
        },
        {
          name: 'c',
          type: 'object',
          fields: [
            {name: 'pl', type: 'string'},
            {name: 'en', type: 'string'},
          ],
        },
      ],
    }),

    defineField({
      name: 'correctOption',
      title: 'Correct option',
      type: 'string',
      options: {
        list: ['a', 'b', 'c'],
      },
    }),

    defineField({
      name: 'explanation',
      title: 'Explanation',
      type: 'object',
      fields: [
        {name: 'pl', type: 'text'},
        {name: 'en', type: 'text'},
      ],
    }),

    // ─────────────────────────────
    // MEDIA
    // ─────────────────────────────

    defineField({
      name: 'media',
      title: 'Media',
      type: 'object',
      fields: [
        {
          name: 'type',
          type: 'string',
          options: {
            list: [
              {title: 'Image', value: 'image'},
              {title: 'Video', value: 'video'},
              {title: 'None', value: 'none'},
            ],
          },
          initialValue: 'none',
        },

        {
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          hidden: ({parent}) => parent?.type !== 'image',
        },

        {
          name: 'video',
          title: 'Video file',
          type: 'file',
          options: {
            accept: 'video/*',
          },
          hidden: ({parent}) => parent?.type !== 'video',
        },
      ],
    }),

    // ─────────────────────────────
    // TAGS (ENUM)
    // ─────────────────────────────

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: TAGS.map((t) => ({title: t, value: t})),
      },
    }),
  ],
})
