import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [], // Strip all HTML tags
        allowedAttributes: {},
      }).trim();
    }
    return value;
  });
}
