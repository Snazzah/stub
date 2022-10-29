import { IncomingMessage } from 'http';
import sjson from 'secure-json-parse';

export class ParserError extends Error {
  status: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.status = statusCode;
  }
}

// https://github.com/fastify/fastify/blob/main/lib/contentTypeParser.js#L185
export function parseJSON(req: IncomingMessage, limit = 1024): Promise<any> {
  const contentLength = req.headers['content-length'] === undefined ? NaN : Number(req.headers['content-length']);

  if (contentLength > limit) return Promise.reject(new ParserError('Request body is too large', 413));

  let receivedLength = 0;
  let body = '';

  req.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onEnd);
    req.resume();

    function onData(chunk: string) {
      receivedLength += chunk.length;

      if (receivedLength > limit) {
        req.removeListener('data', onData);
        req.removeListener('end', onEnd);
        req.removeListener('error', onEnd);
        reject(new ParserError('Request body is too large', 413));
        return;
      }

      body += chunk;
    }

    function onEnd(err: any) {
      req.removeListener('data', onData);
      req.removeListener('end', onEnd);
      req.removeListener('error', onEnd);

      if (err !== undefined) return reject(err);

      receivedLength = Buffer.byteLength(body);

      if (!Number.isNaN(contentLength) && receivedLength !== contentLength)
        return reject(new ParserError('Request body size did not match Content-Length'));

      try {
        if (body === '') throw new Error('Invalid JSON body');
        const parsedBody = sjson.parse(body);
        resolve(parsedBody);
      } catch (e) {
        reject(e);
      }
    }
  });
}
