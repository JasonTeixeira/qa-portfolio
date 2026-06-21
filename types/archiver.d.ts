declare module 'archiver' {
  import type { Writable } from 'node:stream';

  type Archiver = {
    pipe(stream: Writable): void;
    append(source: string | Buffer, options: { name: string }): void;
    finalize(): Promise<void>;
    on(event: 'error', listener: (error: Error) => void): void;
  };

  export default function archiver(format: 'zip', options?: { zlib?: { level?: number } }): Archiver;
}
