declare module 'wav' {
    import { Transform, TransformOptions } from 'stream';

    export class Reader extends Transform {
        constructor(opts?: TransformOptions);
        on(event: 'format', listener: (format: any) => void): this;
        on(event: string | symbol, listener: (...args: any[]) => void): this;
    }

    export class Writer extends Transform {
        constructor(opts?: WriterOptions);
    }
    
    export interface WriterOptions extends TransformOptions {
        format?: any;
        sampleRate?: number;
        channels?: number;
        bitDepth?: number;
    }
}
