import { describe, expect, test } from 'vitest'

import { videoObjectFromYouTube } from '../video-object'

describe('YouTube VideoObject', () => {
  test('uses the shared parser for watch URLs and verified metadata only', () => {
    expect(
      videoObjectFromYouTube({
        url: 'https://www.youtube.com/watch?v=IK7jw0fu3zE',
        title: 'فيديو المشروع',
        description: 'توثيق واضح لمرحلة من مراحل تنفيذ المشروع.',
        uploadDate: '2026-08-12',
      }),
    ).toMatchObject({
      '@type': 'VideoObject',
      thumbnailUrl: 'https://i.ytimg.com/vi/IK7jw0fu3zE/maxresdefault.jpg',
      embedUrl: 'https://www.youtube.com/embed/IK7jw0fu3zE',
      uploadDate: '2026-08-12',
    })
  })

  test('omits VideoObject when a verified publication date is unavailable', () => {
    expect(
      videoObjectFromYouTube({
        url: 'https://youtu.be/IK7jw0fu3zE',
        title: 'فيديو المشروع',
        description: 'توثيق واضح لمرحلة من مراحل تنفيذ المشروع.',
      }),
    ).toBeNull()
  })
})
