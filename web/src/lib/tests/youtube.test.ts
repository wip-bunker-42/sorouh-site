import { describe, expect, test } from 'vitest'

import { parseYouTubeUrl } from '../youtube'

describe('parseYouTubeUrl', () => {
  test.each([
    ['https://youtube.com/shorts/IK7jw0fu3zE?feature=share', 'IK7jw0fu3zE'],
    ['https://youtube.com/shorts/esZBNafjbQw', 'esZBNafjbQw'],
    ['https://youtube.com/shorts/H8w3JVB4P48', 'H8w3JVB4P48'],
    ['https://youtube.com/shorts/_8Y1ACr_tus?feature=share', '_8Y1ACr_tus'],
    ['https://www.youtube.com/watch?v=IK7jw0fu3zE', 'IK7jw0fu3zE'],
    ['https://youtu.be/IK7jw0fu3zE', 'IK7jw0fu3zE'],
    ['https://www.youtube.com/embed/IK7jw0fu3zE', 'IK7jw0fu3zE'],
  ])('extracts %s', (url, id) => {
    expect(parseYouTubeUrl(url)).toEqual({
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    })
  })

  test.each([
    'https://youtube.com/playlist?list=PL123',
    'https://youtube.com/watch?v=IK7jw0fu3zE&list=PL123',
    'https://example.com/watch?v=IK7jw0fu3zE',
    'https://youtube.com/shorts/',
    'https://youtube.com/shorts/not-safe!',
    'javascript:alert(1)',
  ])('rejects %s', (url) => expect(parseYouTubeUrl(url)).toBeNull())
})
